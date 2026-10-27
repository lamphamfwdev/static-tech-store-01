# Nguồn và cách thay ảnh

Cập nhật: 21/10/2026.

## Bộ ảnh đang đi kèm dự án

Sáu ảnh JPEG trong `assets/images/` được tạo bằng công cụ ImageGen tích hợp, dùng ảnh mockup do người dùng cung cấp (`7fb997d9-ecd3-4b70-b55a-77aacdba035a.png`) làm tham chiếu về bố cục, vật thể, màu và ánh sáng. Đây là ảnh minh họa được tạo cho bản giao diện demo; không phải ảnh chụp hoặc bộ ảnh sản phẩm chính thức của Apple, Huawei hay Beats. Ảnh minh họa có thể khác sản phẩm thật.

Dự án chứa dữ liệu ảnh thực ngay trong các tệp JPEG, không sử dụng ảnh nhúng trong SVG, không hotlink ảnh và không cần Internet để tải bộ ảnh này. SVG `logo.svg` là logo vector riêng dùng cho biểu tượng màu cam giống mockup.

| Tệp | Kích thước | Nội dung | Điểm căn ảnh đề xuất |
| --- | --- | --- | --- |
| `hero-tech.jpg` | 2172 × 724 | MacBook, tai nghe đen và bàn đá; khoảng trống tối bên trái | `center center` |
| `earbuds.jpg` | 1448 × 1086 | Tai nghe trắng trong hộp mở trên đá | `center center` |
| `iphone.jpg` | 1774 × 887 | Điện thoại xanh được cầm trên tay | `center center` |
| `macbook.jpg` | 1774 × 887 | Laptop trên bàn gỗ ánh sáng ấm | `center center` |
| `powerbeats.jpg` | 1774 × 887 | Tai nghe thể thao đen có móc tai | `center center` |
| `keyboard.jpg` | 1774 × 887 | Bàn phím trắng/đen và chuột trên bàn gỗ | `center center` |

PNG gốc được chuyển sang JPEG chất lượng 90 để giảm dung lượng, không cắt hoặc sửa nội dung hình ảnh. Hero có tỷ lệ khoảng 3:1; ảnh chính tai nghe 4:3; các ảnh sản phẩm nhỏ 2:1.

## Ba ảnh bổ sung cho thư viện sản phẩm — 21/10/2026

Ba ảnh vuông dưới đây được tạo riêng bằng **ImageGen tích hợp**, dùng ảnh `iphone.jpg` có sẵn làm tham chiếu về điện thoại xanh nhạt, cụm hai camera dọc, chất liệu và ánh sáng. Ảnh bìa `iphone.jpg` được giữ nguyên. Các ảnh mới minh họa ba góc nhìn để thử thư viện tối đa 4 hình; không phải ảnh sản phẩm chính thức và không bảo đảm mô tả đúng thông số của một thiết bị thật.

| Tệp | Nội dung |
| --- | --- |
| `iphone-detail-1.jpg` | Góc nhìn từ trên xuống, toàn bộ điện thoại đặt trên mặt bàn đá sáng |
| `iphone-detail-2.jpg` | Cận cảnh cụm hai camera và mặt lưng xanh nhạt |
| `iphone-detail-3.jpg` | Góc nghiêng thấp, thấy cạnh máy và mặt lưng trên bàn đá |

Mỗi ảnh được tạo bằng một yêu cầu riêng, không ghép thành collage. PNG được đổi định dạng sang JPEG chất lượng 90 để tối ưu dung lượng; giữ nguyên khung hình và kích thước, không cắt ghép hoặc thay nội dung sau khi tạo. Không sử dụng CLI/API fallback.

### Prompt dùng chung cho ba ảnh mới

```text
Use case: product-mockup. Asset type: square product gallery photo for a static shop demo. Input image is the exact product-identity and style reference. Create a new square 1:1 photographic view of the SAME pale lime-green phone shown in the reference. Preserve its green color, flat metallic green side rails, rounded rectangular body, two large vertically stacked black rear lenses on a narrow raised oval green camera island, small circular flash to the right, and subtle centered back logo already in the reference. Maintain warm natural daylight, cream/stone tones, realistic glass and metal, restrained shallow depth of field. One phone only. The purpose is illustrative demo catalog imagery, not an official advertisement. No captions, no watermarks, no added brand text, no collage, no split panels.
```

Các phần riêng được nối sau prompt chung:

```text
iphone-detail-1.jpg — View 1: overhead three-quarter editorial product photograph. The entire phone lies face down diagonally on a light warm limestone desk, its back and two cameras completely visible with generous breathing room on all four edges. A soft out-of-focus green plant is only background, not covering the phone. Camera looks down from roughly 40 degrees. Remove the hand from the reference. Square image, centered visual balance.

iphone-detail-2.jpg — View 2: elegant close-up of the upper rear quarter of the same phone, concentrating on the vertically stacked two-lens camera island, circular flash and the exact pale green finish. Keep enough of the green back and flat edge visible to clearly recognize the same phone. Soft warm cream bokeh behind it. No hand visible. Square image with crisp realistic lens reflections and material detail.

iphone-detail-3.jpg — View 3: low three-quarter angle of the same phone lying face down on a clean warm beige stone surface. Show its slim green side rail and subtle side buttons in the foreground while its pale green back and two vertically stacked rear cameras remain clearly recognizable. The complete device fits in the square frame, with softly blurred interior background. No hand, no other electronics, no accessories.
```

## Thay ảnh cho cửa hàng của bạn

1. Đặt ảnh sản phẩm thật của bạn vào `assets/images/`.
2. Cập nhật đường dẫn ảnh ở phần cấu hình hoặc quản trị dữ liệu sản phẩm của dự án.
3. Ưu tiên ảnh hero 3:1, ảnh lớn 4:3, ảnh thẻ nhỏ 2:1 để giữ khung hình giống mẫu.
4. Khi đưa cửa hàng lên hoạt động, thay nội dung sản phẩm, giá và logo bằng dữ liệu/thương hiệu bạn sử dụng.

Logo chữ Nike và các dấu hiệu nhận diện Apple/Beats có trong bản mockup được giữ lại để thể hiện giao diện mẫu. Tài liệu này không khẳng định quyền thương hiệu hay quan hệ đại diện với các hãng.

## Prompt tạo ảnh (có thể tái sử dụng)

Công cụ sử dụng: ImageGen tích hợp. Mỗi tệp được tạo bằng một yêu cầu riêng với ảnh mockup làm tham chiếu. Không sử dụng CLI/API fallback.

### hero-tech.jpg

```text
Use case: product-mockup. Asset type: clean photographic website hero background, 3:1 panoramic landscape. Reference image: the supplied website mockup. Recreate ONLY THE TOP HERO BACKGROUND PHOTOGRAPH with extraordinary fidelity to reference. Do not generate any UI, sidebar, panels, typography, labels, search, buttons, cards, badges, service icons or borders. The photograph depicts a large space-grey Apple MacBook opened partially, rear lid with black Apple emblem facing viewer, on the RIGHT half of a rough pale concrete stone slab. The lid top-left starts around 56% x, top at 12% y, rear lid slopes to 82% x 62% y. Black over-ear headphones sit behind the laptop to the LEFT of laptop, approximately 49% x and 40% y. Soft warm sunlight hits silver metal. Dark charcoal concrete wall on left and blurred green plant at far right. Full left 40% is DARK EMPTY NEGATIVE SPACE, almost black wall above softly dim stone desktop, so large white UI text can be layered later in actual HTML. Rightmost 12% stays dark enough for white side copy. Reference photo details: realistic tactile concrete stone, smooth grey aluminum, shadows, restrained warm neutral palette. Sharp premium product photography. Preserve this exact viewpoint and arrangement as closely as possible. Wide panoramic image only; no text whatsoever.
```

### earbuds.jpg

```text
Use case: product-mockup. Asset type: main product card photograph for a storefront. Input reference: supplied UI mockup; recreate ONLY the large lower-middle white wireless earbud photo, no UI. High fidelity to reference. Landscape 4:3 aspect ratio. A glossy warm ivory-white rounded rectangular charging case stands OPEN on a dark textured rock outdoors, facing viewer at a slight angle. Two white premium wireless earbuds with silicone tips and black acoustic vents nest in the case; lid hinged open facing backwards. Tiny glowing green LED at front center. Large case occupies lower central 65% of photo, with top of open lid about 22% from top, lower edge about 90%. Warm sunlight from upper left, soft cream highlights, cinematic shallow focus; blurred deep green leaves upper right, black and charcoal rock background, small out-of-focus vegetation at left. Photorealistic macro premium product photography, exact composition like reference. No badge, no text, no labels, no borders, no screen, no UI.
```

### iphone.jpg

```text
Use case: product-mockup. Asset type: product card photograph. Input reference: supplied mockup; recreate ONLY the green iPhone held in hand photo in lower section. Landscape image 2:1 aspect ratio. Photorealistic rear close view of a pastel light lime-green Apple iPhone 16 held upright in a person's warm natural hand entering from bottom center-left. The phone sits diagonally about 14 degrees, top of phone tilts right. Two large vertically stacked black camera lenses within raised oval green camera island near upper left corner of phone, small circular flash right. Subtle Apple emblem visible on back. Phone occupies central 50%, stretches down past bottom of photo. Bright soft natural window lighting, out-of-focus interior cream walls and green palm leaves behind phone. Match reference exactly: light lime green phone with dark black edges, realistic hand, premium product photography. No labels, no price, no UI, no badges, no text, no borders.
```

### macbook.jpg

```text
Use case: product-mockup. Asset type: product card photograph. Reference: supplied website mockup. Recreate ONLY the lower-right-top product photo of an open MacBook on a warm wooden desk. Landscape 2:1. Silver MacBook Pro with screen open at approximately 100 degrees, very dark blank screen reflecting softly, keyboard viewed in three quarter view from front left. Computer stretches from 15% left to 90% right, front edge near bottom of image. MacBook dark screen reaches near upper border. Warm brown wooden table, cozy amber lighting from the left, blurred warm tan walls background. Small green succulent in black pot at left rear of laptop, partly cut off black desk accessory near far right bottom. Camera low desk-height product photography, soft natural focus, faithful visual composition to supplied reference. No text, no labels, no UI, no cards or borders.
```

### powerbeats.jpg

```text
Use case: product-mockup. Asset type: product card photograph. Input reference: supplied website mockup. Recreate ONLY the photograph of two BLACK Beats Powerbeats Pro sports earphones in lower-right-middle card. Landscape 2:1. Pair of matte black wireless sporty earphones with tall sweeping oval ear hooks forming two arch shapes, placed side by side on a warm light grey-beige concrete tabletop. Front earphone at left tilted slightly left; earphone at right upright angled gently right. Both small lowercase b white Beats emblems clearly visible on outer bodies. Earhooks rise into upper third of frame. Pair occupies middle 60%, centered composition. Warm cream-beige softly blurred background with sunlit shadows, restrained black and warm neutral palette. Realistic studio product photography with crisp silicone plastic material and shadows, exactly like reference. No display case, no cables, no text, no price, no UI, no badge, no borders.
```

### keyboard.jpg

```text
Use case: product-mockup. Asset type: product card photograph. Reference image: supplied UI mockup. Recreate ONLY the bottom-right mechanical keyboard plus mouse photo, no UI. Landscape 2:1. A compact mechanical Bluetooth keyboard with matte black rectangular chassis, crisp warm off-white keycaps across center letters, charcoal dark keycaps at outer edges, rests diagonally on warm brown wooden desk. View from front-right slightly overhead, keyboard left end near x 8% and right end near 77%, depth top edge near 18% and front edge near 80%. A black smooth wireless mouse sits directly to the right of keyboard, slightly lower than center, near 87% x. Out of focus dark brown workspace background, warm window light from upper left casts gentle shadows. Premium photorealistic product photography, match the reference crop and colors. No typing hands, no monitor, no text, no labels, no price, no UI, no borders.
```

