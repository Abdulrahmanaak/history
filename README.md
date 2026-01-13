# الموسوعة التاريخية (Historical Encyclopedia)

[English Version Below](#historical-encyclopedia-english)

تطبيق تفاعلي للجدول الزمني التاريخي يركز على التاريخ الإسلامي، ويتميز بعرض شرائح ديناميكي، وقدرات تصفية متقدمة، وتصور جغرافي.

## المميزات

- **عرض شرائح تفاعلي**: تنقل عبر الأحداث التاريخية بتجربة سلسة وجذابة.
- **تصفية متقدمة**: إمكانية تصفية الأحداث حسب العصر (مثل: عصر النبوة)، التصنيف الرئيسي، والتصنيف الفرعي.
- **التمثيل البصري**:
  - **[جديد] رسومات تاريخية بأسلوب عتيق**: تتميز الأحداث الرئيسية (خاصة في عصر النبوة / المعالم الإسلامية) الآن برسومات فريدة مصممة بأسلوب الصور الفوتوغرافية العتيقة من القرن التاسع عشر (Vintage 19th-century style) لإضفاء جو تاريخي أصيل ومحترم، مع الالتزام بعدم تصوير الوجوه.
- **خريطة تفاعلية**: 
  - استعراض أماكن الأحداث على خريطة جغرافية مدمجة.
  - **[جديد] تجميع العلامات (Clustering)**: تجميع الأماكن المتقاربة في دائرة واحدة لتفادي الازدحام، مع إمكانية التكبير عند النقر.
  - **[جديد] التنقل التفاعلي**: النقر على عنوان الحدث في الخريطة ينقلك مباشرة إلى تفاصيله في عرض الشرائح.

- **تصميم متجاوب**: واجهة متوافقة تماماً مع الأجهزة المكتبية والمحمولة، مع دعم كامل للغة العربية (RTL).
- **التنقل عبر لوحة المفاتيح**: استخدم مفاتيح الأسهم (اليمين/اليسار) للتنقل، وزر المسافة (Space) للإيقاف/التشغيل التلقائي.

## تفاصيل تقنية

- **الواجهة الأمامية**: Vanilla JavaScript, HTML5, CSS3.
- **البيانات**: ملفات JSON مهيكلة للأحداث والتصنيفات.
- **الخريطة**: مكتبة Leaflet.js مع خرائط أساس داكنة (Dark Matter) وإضافة MarkerCluster.

## الإعداد والتشغيل

1. **استنساخ المستودع**:
   ```bash
   git clone <repository-url>
   ```
2. **تشغيل خادم محلي**:
   قم بتشغيل المجلد باستخدام أي خادم ويب محلي (مثل Live Server في VS Code أو `serve`).
   ```bash
   npx serve .
   ```
3. **فتح التطبيق**:
   افتح الرابط `http://localhost:3000` (أو المنفذ المخصص) في متصفحك.

---

<a id="historical-encyclopedia-english"></a>
# Historical Encyclopedia (English)

An interactive historical timeline application focusing on Islamic history, featuring a dynamic slideshow interface, filtering capabilities, and geographic visualization.

## Features

- **Interactive Slideshow**: Navigate through historical events with a seamless slideshow experience.
- **Advanced Filtering**: Filter events by Era (e.g., Prophetic Era), Category, and Sub-category.
- **Visual Representation**: 
  - **[NEW] Authentic Vintage Illustrations**: Selected key events (specifically in the Prophetic Era / Islamic Landmarks) now feature unique, generated illustrations designed in a vintage 19th-century photograph style to provide an authentic historical atmosphere without depicting human faces.
- **Geographic Map**: 
  - Visualize events on an interactive map.
  - **[NEW] Marker Clustering**: Groups nearby locations into clusters to prevent clutter, with zoom-to-expand functionality.
  - **[NEW] Interactive Navigation**: Clicking an event title on the map navigates directly to its slide.
- **Responsive Design**: Optimized for both desktop and mobile viewing with RTL support.
- **Keyboard Navigation**: Use arrow keys to navigate and spacebar to toggle autoplay.

## Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3.
- **Data**: JSON-based event data structure.
- **Map Integration**: Leaflet.js with Dark Matter basemaps and MarkerCluster plugin.

## Setup

1. Clone the repository.
2. Serve the directory using a local web server (e.g., Live Server in VS Code, Python `http.server`, or `npm install -g serve`).
   ```bash
   npx serve .
   ```
3. Open `http://localhost:3000` (or the port provided) in your browser.
