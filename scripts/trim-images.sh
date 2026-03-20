#\!/bin/bash
# Auto-trim white borders from product images
# Only trims if >15% of area is white border

DIR="/var/www/sequoiaspeed.com.co/public/products"
FUZZ="10%"
THRESHOLD=15  # minimum % area reduction to trigger trim
COUNT=0
TRIMMED=0

for img in "$DIR"/*.jpg; do
  [ -f "$img" ] || continue
  COUNT=$((COUNT + 1))
  
  # Get original dimensions
  orig=$(identify -format "%w %h" "$img" 2>/dev/null)
  ow=$(echo "$orig" | cut -d" " -f1)
  oh=$(echo "$orig" | cut -d" " -f2)
  
  [ -z "$ow" ] || [ -z "$oh" ] && continue
  [ "$ow" -eq 0 ] || [ "$oh" -eq 0 ] && continue
  
  orig_area=$((ow * oh))
  
  # Get trimmed dimensions (dry run)
  trimmed=$(convert "$img" -fuzz $FUZZ -trim -format "%w %h" info: 2>/dev/null)
  tw=$(echo "$trimmed" | cut -d" " -f1)
  th=$(echo "$trimmed" | cut -d" " -f2)
  
  [ -z "$tw" ] || [ -z "$th" ] && continue
  [ "$tw" -eq 0 ] || [ "$th" -eq 0 ] && continue
  
  trim_area=$((tw * th))
  reduction=$(( (orig_area - trim_area) * 100 / orig_area ))
  
  if [ "$reduction" -ge "$THRESHOLD" ]; then
    # Actually trim the image
    convert "$img" -fuzz $FUZZ -trim +repage -quality 92 "$img"
    TRIMMED=$((TRIMMED + 1))
    echo "TRIMMED: $(basename "$img") ${ow}x${oh} -> ${tw}x${th} (-${reduction}%)"
  fi
done

echo ""
echo "Done. Checked $COUNT images, trimmed $TRIMMED."
