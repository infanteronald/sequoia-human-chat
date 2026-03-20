import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

function readJson(filename: string) {
  const raw = fs.readFileSync(path.join(SCRIPTS_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

function readTsv(filename: string): string[][] {
  const raw = fs.readFileSync(path.join(SCRIPTS_DIR, filename), "utf-8");
  return raw.trim().split("\n").map((line) => line.split("\t"));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Starting migration...");

  // 1. Categories (TSV: id, name, slug, parentId, active)
  console.log("\n=== Migrating Categories ===");
  const catRows = readTsv("ps_categories.tsv");
  const categoryMap = new Map<number, string>();

  for (const [idStr, name, slug, parentIdStr, activeStr] of catRows) {
    const id = parseInt(idStr);
    if (id <= 2) continue;
    try {
      const created = await prisma.category.upsert({
        where: { prestashopId: id },
        update: { name, slug: slug || slugify(name) },
        create: {
          name,
          slug: slug || slugify(name),
          isActive: activeStr === "1",
          prestashopId: id,
        },
      });
      categoryMap.set(id, created.id);
      console.log(`  Category: ${name}`);
    } catch (e: any) {
      console.error(`  Error category ${name}: ${e.message}`);
    }
  }

  // Set parent relationships
  for (const [idStr, , , parentIdStr] of catRows) {
    const id = parseInt(idStr);
    const parentId = parseInt(parentIdStr);
    if (id <= 2 || parentId <= 2) continue;
    const prismaId = categoryMap.get(id);
    const parentPrismaId = categoryMap.get(parentId);
    if (prismaId && parentPrismaId) {
      await prisma.category.update({
        where: { id: prismaId },
        data: { parentId: parentPrismaId },
      });
    }
  }
  console.log(`  Total: ${categoryMap.size} categories`);

  // 2. Products (TSV: id, name, slug, price, reference, active, categoryId, weight, metaTitle, metaDesc)
  console.log("\n=== Migrating Products ===");
  const prodRows = readTsv("ps_products.tsv");
  const productMap = new Map<number, string>();
  const defaultCat = await prisma.category.findFirst();

  for (const row of prodRows) {
    const [idStr, name, slug, priceStr, reference, activeStr, catIdStr, weightStr, metaTitle, metaDesc] = row;
    const id = parseInt(idStr);
    const catId = categoryMap.get(parseInt(catIdStr)) || defaultCat?.id;
    if (!catId) continue;

    try {
      const created = await prisma.product.upsert({
        where: { prestashopId: id },
        update: { name, price: parseFloat(priceStr) || 0 },
        create: {
          name,
          slug: slug || slugify(name),
          price: parseFloat(priceStr) || 0,
          reference: reference && reference !== "NULL" ? reference : null,
          isActive: activeStr === "1",
          isFeatured: activeStr === "1",
          weight: weightStr && weightStr !== "0.000000" ? parseFloat(weightStr) : null,
          categoryId: catId,
          metaTitle: metaTitle && metaTitle !== "NULL" ? metaTitle : null,
          metaDescription: metaDesc && metaDesc !== "NULL" ? metaDesc : null,
          prestashopId: id,
        },
      });
      productMap.set(id, created.id);
      if (activeStr === "1") console.log(`  Product: ${name} ($${priceStr})`);
    } catch (e: any) {
      // Duplicate slug - append id
      try {
        const created = await prisma.product.create({
          data: {
            name,
            slug: `${slug || slugify(name)}-${id}`,
            price: parseFloat(priceStr) || 0,
            reference: reference && reference !== "NULL" ? reference : null,
            isActive: activeStr === "1",
            isFeatured: activeStr === "1",
            categoryId: catId,
            prestashopId: id,
          },
        });
        productMap.set(id, created.id);
      } catch (e2: any) {
        console.error(`  Error product ${name}: ${e2.message}`);
      }
    }
  }
  console.log(`  Total: ${productMap.size} products`);

  // 3. Product Variants
  console.log("\n=== Migrating Variants ===");
  const variants = readJson("ps_variants.json");
  const variantAttrs = readJson("ps_variant_attrs.json");
  const stock = readJson("ps_stock.json");

  const attrByVariant = new Map<number, string[]>();
  for (const attr of variantAttrs) {
    const existing = attrByVariant.get(attr.variantId) || [];
    existing.push(`${attr.groupName}: ${attr.attributeName}`);
    attrByVariant.set(attr.variantId, existing);
  }

  const stockByVariant = new Map<number, number>();
  for (const s of stock) {
    stockByVariant.set(s.variantId, s.quantity);
  }

  let variantCount = 0;
  for (const v of variants) {
    const productId = productMap.get(v.productId);
    if (!productId) continue;

    const attrs = attrByVariant.get(v.id) || ["Default"];
    const name = attrs.join(" / ");
    const qty = stockByVariant.get(v.id) || 0;

    try {
      await prisma.productVariant.upsert({
        where: { prestashopId: v.id },
        update: { name, stock: qty, priceModifier: parseFloat(v.price) || 0 },
        create: {
          productId,
          name,
          sku: v.reference || null,
          priceModifier: parseFloat(v.price) || 0,
          stock: qty,
          isActive: true,
          prestashopId: v.id,
        },
      });
      variantCount++;
    } catch (e: any) {
      console.error(`  Error variant ${v.id}: ${e.message}`);
    }
  }
  console.log(`  Total: ${variantCount} variants`);

  // 4. Product Images
  console.log("\n=== Migrating Image References ===");
  const images = readJson("ps_images.json");
  let imageCount = 0;

  for (const img of images) {
    const productId = productMap.get(img.productId);
    if (!productId) continue;

    const url = `/products/${img.id}-large_default.webp`;

    try {
      await prisma.productImage.upsert({
        where: { prestashopId: img.id },
        update: { url, position: img.position },
        create: {
          productId,
          url,
          position: img.position || 0,
          isCover: img.cover === 1,
          prestashopId: img.id,
        },
      });
      imageCount++;
    } catch (e: any) {
      console.error(`  Error image ${img.id}: ${e.message}`);
    }
  }
  console.log(`  Total: ${imageCount} image references`);

  // 5. Customers
  console.log("\n=== Migrating Customers ===");
  const customers = readJson("ps_customers.json");
  const customerMap = new Map<number, string>();

  for (const cust of customers) {
    try {
      const name = `${cust.firstname} ${cust.lastname}`.trim();
      const created = await prisma.user.upsert({
        where: { email: cust.email },
        update: { name },
        create: {
          email: cust.email,
          name,
          isActive: cust.active === 1,
          prestashopId: cust.id,
          createdAt: new Date(cust.createdAt),
        },
      });
      customerMap.set(cust.id, created.id);
    } catch {
      // Duplicate emails, skip
    }
  }
  console.log(`  Total: ${customerMap.size} customers`);

  // 6. Orders
  console.log("\n=== Migrating Orders ===");
  const orders = readJson("ps_orders.json");
  const orderDetails = readJson("ps_order_details.json");

  const detailsByOrder = new Map<number, any[]>();
  for (const d of orderDetails) {
    const existing = detailsByOrder.get(d.orderId) || [];
    existing.push(d);
    detailsByOrder.set(d.orderId, existing);
  }

  const statusMap: Record<number, string> = {
    1: "PENDING", 2: "CONFIRMED", 3: "PROCESSING", 4: "SHIPPED",
    5: "DELIVERED", 6: "CANCELLED", 7: "REFUNDED", 8: "PENDING",
    9: "PENDING", 10: "PENDING", 11: "CONFIRMED", 12: "PENDING",
  };

  let orderCount = 0;
  const firstProduct = productMap.values().next().value;

  for (const order of orders) {
    const userId = customerMap.get(order.customerId);
    if (!userId) continue;

    const items = detailsByOrder.get(order.id) || [];
    const status = statusMap[order.status] || "PENDING";

    try {
      const orderItems = items.map((item: any) => ({
        productId: productMap.get(item.productId) || firstProduct!,
        name: item.productName,
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || 1,
      }));

      if (orderItems.length === 0) {
        orderItems.push({
          productId: firstProduct!,
          name: "Producto migrado",
          price: parseFloat(order.total) || 0,
          quantity: 1,
        });
      }

      await prisma.order.upsert({
        where: { prestashopId: order.id },
        update: { status: status as any },
        create: {
          orderNumber: `PS-${order.reference}`,
          userId,
          status: status as any,
          subtotal: parseFloat(order.total) || 0,
          total: parseFloat(order.total) || 0,
          prestashopId: order.id,
          createdAt: new Date(order.createdAt),
          items: { create: orderItems },
          payment: {
            create: {
              method: "TRANSFER" as any,
              status: ["CONFIRMED", "DELIVERED", "SHIPPED"].includes(status) ? "APPROVED" as any : "PENDING" as any,
              amount: parseFloat(order.total) || 0,
            },
          },
        },
      });
      orderCount++;
    } catch (e: any) {
      console.error(`  Error order ${order.reference}: ${e.message}`);
    }
  }
  console.log(`  Total: ${orderCount} orders`);

  console.log("\n=== Migration Complete ===");
  console.log(`  Categories: ${categoryMap.size}`);
  console.log(`  Products: ${productMap.size}`);
  console.log(`  Variants: ${variantCount}`);
  console.log(`  Images: ${imageCount}`);
  console.log(`  Customers: ${customerMap.size}`);
  console.log(`  Orders: ${orderCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);
