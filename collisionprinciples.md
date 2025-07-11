Excellent! Let me clearly define all the different types of collisions we need to avoid in the timeline system:

## **Collision Types We Must Prevent:**

### **1. Pill-to-Pill Collisions (Center Line)**
- **Pills should never visually overlap** with each other, regardless of their associated card sides
- Pills are always positioned on the center line, so they're in direct competition for space
- Minimum distance: Enough space so pills don't touch or create visual confusion when reading dates

### **2. Left Side Card-to-Card Collisions**
- **Left side cards should never overlap** with other left side cards
- Cards have physical height (~180-200px) and need vertical breathing room
- Includes: Card backgrounds, text content, borders, shadows
- Minimum distance: Enough space for full card readability without visual interference

### **3. Right Side Card-to-Card Collisions**  
- **Right side cards should never overlap** with other right side cards
- Same rules as left side - cards need full vertical space
- Includes: Card backgrounds, text content, borders, shadows  
- Minimum distance: Enough space for full card readability without visual interference

### **4. Cross-Side Card Interference (Left ↔ Right)**
- **Left and right cards should maintain visual separation**
- While they're horizontally separated, if positioned too close vertically, they can create visual chaos
- The timeline should flow clearly top-to-bottom without left/right cards creating reading confusion
- Minimum distance: Smaller than same-side spacing, but enough to maintain timeline flow clarity

### **5. Pill-to-Card Visual Interference**
- **Pills shouldn't visually interfere with card reading**
- Pills sit in the center, cards extend left/right, but connection lines and visual hierarchy matter
- Pills should maintain clear association with their respective cards

### **6. Same-Date Event Special Cases**
- **Same-date events can be closer together** than different-date events
- But still must avoid all the above collision types
- Should allow for natural chronological grouping while maintaining readability

## **Per-Side Breakdown:**

### **Left Side Timeline:**
- Left cards vs other left cards: **NO overlap**
- Left cards vs center pills: **Clear visual hierarchy** 
- Left cards vs right cards: **Minimal interference** (smaller spacing tolerance)

### **Right Side Timeline:**
- Right cards vs other right cards: **NO overlap**
- Right cards vs center pills: **Clear visual hierarchy**
- Right cards vs left cards: **Minimal interference** (smaller spacing tolerance)

### **Overall Timeline Flow:**
- **Top-to-bottom readability** maintained
- **Chronological clarity** preserved
- **Visual hierarchy** between pills, connecting lines, and cards
- **No visual chaos** from overlapping elements

---
