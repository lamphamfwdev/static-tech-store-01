/* Dữ liệu mẫu chạy ngay, kể cả khi mở index.html trực tiếp. Admin có thể xuất/nhập JSON. */
window.SHOP_DATA = {
  settings: {
    name: 'Nike', slogan: 'Uy tín · Giá rẻ', logo: 'assets/images/logo.svg',
    seoTitle: 'Nike — Phụ kiện công nghệ',
    seoDescription: 'Khám phá thiết bị công nghệ, tìm sản phẩm phù hợp và tạo nội dung đặt hàng để liên hệ cửa hàng.',
    heroEyebrow: 'PHỤ KIỆN CÔNG NGHỆ',
    heroTitle: 'Công nghệ\nphù hợp với bạn',
    heroDescription: 'Khám phá các thiết bị công nghệ được chọn lọc,\nchính hãng và giá hợp lý.',
    heroImage: 'assets/images/hero-tech.jpg',
    heroProductName: 'MacBook', heroProductDescription: 'Hiệu suất mạnh mẽ\ncho mọi ý tưởng.',
    heroBadge: 'Sản phẩm chính hãng', heroHighlight: 'Uy tín · Giá tốt',
    pageSize: 5,
    about: 'Những thiết bị bạn yêu thích. Trải nghiệm công nghệ phù hợp với cuộc sống của bạn.',
    address: '', phone: '', email: '', fanpageName: 'Nike', fanpageUsername: '',
    contactChannel: 'messenger',
    channels: { messenger: '', instagram: '', zalo: '', zaloOA: '', tiktok: '' }
  },
  priceFilters: [
    {id:'under-1m',label:'Dưới 1 triệu',min:0,max:999999,sort:1,enabled:true},
    {id:'1m-5m',label:'1 – 5 triệu',min:1000000,max:4999999,sort:2,enabled:true},
    {id:'5m-10m',label:'5 – 10 triệu',min:5000000,max:10000000,sort:3,enabled:true},
    {id:'over-10m',label:'Trên 10 triệu',min:10000001,max:null,sort:4,enabled:true}
  ],
  products: [
    {id:'p001',code:'HP-FB3',name:'Huawei FreeBuds Pro 3',category:'Tai nghe thể thao',shortDescription:'Âm thanh sống động, chống ồn chủ động',description:'Thiết kế nhỏ gọn, đeo thoải mái và dễ mang theo. Chống ồn chủ động giúp bạn tập trung hơn khi làm việc, nghe nhạc hoặc di chuyển.\n\nSản phẩm và giá trong bộ dữ liệu này dùng để xem thử giao diện. Hình ảnh minh họa theo phong cách mockup; vui lòng thay bằng ảnh và thông số sản phẩm thực tế trước khi kinh doanh.',price:2990000,originalPrice:0,tags:['Chống ồn','Bluetooth','Bán chạy'],featured:true,visible:true,status:'active',stock:15,images:['assets/images/earbuds.jpg'],archived:false,updatedAt:'2026-10-19T08:00:00Z'},
    {id:'p002',code:'AP-IP16',name:'Apple iPhone 16',category:'Điện thoại',shortDescription:'Hiệu năng vượt trội, thiết kế tinh tế',description:'Thiết kế hiện đại với sắc xanh nhẹ nhàng. Lựa chọn dành cho nhu cầu liên lạc, chụp ảnh và giải trí hằng ngày.\n\nĐây là dữ liệu và hình ảnh minh họa để thử giao diện, không phải thông báo giá bán chính thức.',price:18990000,originalPrice:0,tags:['Điện thoại','iPhone','Màu xanh'],featured:true,visible:true,status:'active',stock:8,images:['assets/images/iphone.jpg','assets/images/iphone-detail-1.jpg','assets/images/iphone-detail-2.jpg','assets/images/iphone-detail-3.jpg'],archived:false,updatedAt:'2026-10-18T08:00:00Z'},
    {id:'p003',code:'AP-MBP3',name:'MacBook Pro M3',category:'Macbook',shortDescription:'Màn hình Retina, hiệu năng đỉnh cao',description:'Không gian làm việc gọn gàng cùng thiết kế kim loại tinh tế. Phù hợp minh họa danh mục máy tính xách tay.\n\nLiên hệ cửa hàng để xác nhận cấu hình, tình trạng và giá thực tế. Đây là sản phẩm mẫu.',price:32990000,originalPrice:0,tags:['Laptop','MacBook','Làm việc'],featured:true,visible:true,status:'active',stock:5,images:['assets/images/macbook.jpg','assets/images/hero-tech.jpg'],archived:false,updatedAt:'2026-10-17T08:00:00Z'},
    {id:'p004',code:'BT-PBP',name:'Beats Powerbeats Pro',category:'Tai nghe thể thao',shortDescription:'Sẵn sàng cho từng chuyển động',description:'Kiểu dáng vòng tai chắc chắn, màu đen tối giản và hộp đựng gọn gàng.\n\nẢnh, thông tin và giá là dữ liệu minh họa để trải nghiệm website.',price:4590000,originalPrice:0,tags:['Thể thao','Không dây','Beats'],featured:false,visible:true,status:'active',stock:12,images:['assets/images/powerbeats.jpg'],archived:false,updatedAt:'2026-10-16T08:00:00Z'},
    {id:'p005',code:'KB-BT01',name:'Bàn phím cơ Bluetooth',category:'Phụ kiện khác',shortDescription:'Góc làm việc, theo cách của bạn',description:'Bàn phím cơ với tông màu trung tính, kết nối không dây và kiểu dáng nhỏ gọn cho bàn làm việc.\n\nDữ liệu minh họa. Vui lòng xác nhận thông số tại cửa hàng.',price:1290000,originalPrice:0,tags:['Bàn phím','Bluetooth','Phụ kiện'],featured:false,visible:true,status:'active',stock:20,images:['assets/images/keyboard.jpg'],archived:false,updatedAt:'2026-10-15T08:00:00Z'},
    {id:'p006',code:'TN-ANC',name:'Tai nghe không dây ANC',category:'Tai nghe thể thao',shortDescription:'Nhỏ gọn, thư giãn cùng âm nhạc',description:'Sản phẩm mẫu minh họa chức năng nhãn giảm giá. Thông số và hình ảnh cần thay bằng dữ liệu thật trước khi sử dụng bán hàng.',price:890000,originalPrice:1190000,tags:['Ưu đãi','Chống ồn'],featured:false,visible:true,status:'active',stock:25,images:['assets/images/earbuds.jpg'],archived:false,updatedAt:'2026-10-14T08:00:00Z'},
    {id:'p007',code:'MB-AIR',name:'MacBook Air',category:'Macbook',shortDescription:'Nhẹ nhàng cho công việc mỗi ngày',description:'Dữ liệu mẫu minh họa danh mục Macbook, mức giá và thư viện ảnh.',price:22990000,originalPrice:24990000,tags:['Mỏng nhẹ','Laptop'],featured:false,visible:true,status:'active',stock:3,images:['assets/images/macbook.jpg','assets/images/hero-tech.jpg'],archived:false,updatedAt:'2026-10-13T08:00:00Z'},
    {id:'p008',code:'KB-MINI',name:'Bàn phím cơ Mini',category:'Phụ kiện khác',shortDescription:'Tối giản diện tích, trọn vẹn cảm hứng',description:'Sản phẩm mẫu dùng kiểm tra bộ lọc dưới 1 triệu.',price:790000,originalPrice:0,tags:['Bàn phím','Mini'],featured:false,visible:true,status:'active',stock:null,images:['assets/images/keyboard.jpg'],archived:false,updatedAt:'2026-10-12T08:00:00Z'},
    {id:'p009',code:'TN-PRO',name:'Tai nghe thể thao Pro',category:'Tai nghe thể thao',shortDescription:'Tự do trong từng nhịp chạy',description:'Sản phẩm mẫu dùng kiểm tra trạng thái hết hàng. Nút thêm giỏ được khóa.',price:5490000,originalPrice:0,tags:['Thể thao'],featured:false,visible:true,status:'out_of_stock',stock:0,images:['assets/images/powerbeats.jpg'],archived:false,updatedAt:'2026-10-11T08:00:00Z'},
    {id:'p010',code:'IP-GREEN',name:'Điện thoại Green Edition',category:'Điện thoại',shortDescription:'Sắc màu mới cho những điều quen thuộc',description:'Sản phẩm mẫu dùng kiểm tra mức giá 5–10 triệu và điều chỉnh số lượng theo tồn kho.',price:8990000,originalPrice:9990000,tags:['Điện thoại','Màu xanh'],featured:false,visible:true,status:'active',stock:2,images:['assets/images/iphone.jpg'],archived:false,updatedAt:'2026-10-10T08:00:00Z'},
    {id:'p011',code:'TN-NHAP',name:'Tai nghe mới — bản nháp',category:'Tai nghe thể thao',shortDescription:'Sản phẩm mẫu chưa công bố',description:'Bản nháp để thử tính năng quản trị. Sản phẩm không xuất hiện trên website khách hàng.',price:1590000,originalPrice:0,tags:[],featured:false,visible:false,status:'draft',stock:null,images:['assets/images/earbuds.jpg'],archived:false,updatedAt:'2026-10-09T08:00:00Z'},
    {id:'p012',code:'KB-AN',name:'Bàn phím — tạm ẩn',category:'Phụ kiện khác',shortDescription:'Sản phẩm mẫu tạm ẩn',description:'Dùng kiểm tra bật/tắt hiển thị trong Admin.',price:990000,originalPrice:0,tags:[],featured:false,visible:false,status:'active',stock:4,images:['assets/images/keyboard.jpg'],archived:false,updatedAt:'2026-10-08T08:00:00Z'}
  ]
};
