import { PlacesProvider, PlaceResult } from './provider';

const MOCK_DATABASE: PlaceResult[] = [
  // SPA - TP.HCM
  { placeId: 'spa_q1_01', displayName: 'Spa Thanh Thủy', formattedAddress: '123 Nguyễn Văn A, Quận 1, TP.HCM', phone: '0901234567', websiteUri: 'https://spathanhthuy.com', googleMapsUri: 'https://maps.google.com/?cid=spa01', rating: 4.2, userRatingCount: 56 },
  { placeId: 'spa_q1_02', displayName: 'Spa Hoàng Gia', formattedAddress: '456 Lê Lợi, Quận 1, TP.HCM', phone: '0912345678', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=spa02', rating: 3.8, userRatingCount: 34 },
  { placeId: 'spa_q3_01', displayName: 'Thẩm Mỹ Viện Lavender', formattedAddress: '789 Đồng Khởi, Quận 3, TP.HCM', phone: '0923456789', websiteUri: 'https://lavenderspa.vn', googleMapsUri: 'https://maps.google.com/?cid=spa03', rating: 4.5, userRatingCount: 128 },
  { placeId: 'spa_q7_01', displayName: 'Spa Mộc Trà', formattedAddress: '321 Hai Bà Trưng, Quận 7, TP.HCM', phone: '0934567890', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=spa04', rating: 4.0, userRatingCount: 42 },
  { placeId: 'spa_q7_02', displayName: 'Spa Sen Vàng', formattedAddress: '654 Nguyễn Huệ, Quận 7, TP.HCM', phone: '0945678901', websiteUri: 'https://senvangspa.com', googleMapsUri: 'https://maps.google.com/?cid=spa05', rating: 4.7, userRatingCount: 89 },
  { placeId: 'spa_tanphu_01', displayName: 'Spa Hoa Hồng', formattedAddress: '12 Trường Chinh, Tân Phú, TP.HCM', phone: '0901112222', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=spa06', rating: 4.1, userRatingCount: 23 },
  { placeId: 'spa_bthanh_01', displayName: 'Spa Thiên Nhiên', formattedAddress: '45 Điện Biên Phủ, Bình Thạnh, TP.HCM', phone: '0902223333', websiteUri: 'https://thiennhienspa.com', googleMapsUri: 'https://maps.google.com/?cid=spa07', rating: 3.9, userRatingCount: 67 },
  { placeId: 'spa_gvap_01', displayName: 'Spa Bảo Ngọc', formattedAddress: '78 Quang Trung, Gò Vấp, TP.HCM', phone: '0903334444', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=spa08', rating: 4.3, userRatingCount: 45 },
  { placeId: 'spa_pnhu_01', displayName: 'Spa Ngọc Trinh', formattedAddress: '99 Phan Xích Long, Phú Nhuận, TP.HCM', phone: '0904445555', websiteUri: 'https://ngoctrinhspa.vn', googleMapsUri: 'https://maps.google.com/?cid=spa09', rating: 4.6, userRatingCount: 112 },
  { placeId: 'spa_td_01', displayName: 'Spa Thủ Đức', formattedAddress: '55 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0905556666', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=spa10', rating: 3.7, userRatingCount: 18 },

  // NHA KHOA - TP.HCM
  { placeId: 'dental_q1_01', displayName: 'Nha Khoa Kim', formattedAddress: '100 Lê Duẩn, Quận 1, TP.HCM', phone: '0911112222', websiteUri: 'https://nhakhoakim.com', googleMapsUri: 'https://maps.google.com/?cid=den01', rating: 4.4, userRatingCount: 234 },
  { placeId: 'dental_q3_01', displayName: 'Nha Khoa Paris', formattedAddress: '200 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', phone: '0912223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=den02', rating: 4.1, userRatingCount: 156 },
  { placeId: 'dental_pnhu_01', displayName: 'Nha Khoa Việt Mỹ', formattedAddress: '300 Phan Đăng Lưu, Phú Nhuận, TP.HCM', phone: '0913334444', websiteUri: 'https://vietmydental.vn', googleMapsUri: 'https://maps.google.com/?cid=den03', rating: 4.5, userRatingCount: 89 },
  { placeId: 'dental_q7_01', displayName: 'Nha Khoa Sài Gòn', formattedAddress: '400 Nguyễn Thị Thập, Quận 7, TP.HCM', phone: '0914445555', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=den04', rating: 3.9, userRatingCount: 67 },
  { placeId: 'dental_gvap_01', displayName: 'Nha Khoa Thái Bình', formattedAddress: '500 Nguyễn Oanh, Gò Vấp, TP.HCM', phone: '0915556666', websiteUri: 'https://thaibinhdental.com', googleMapsUri: 'https://maps.google.com/?cid=den05', rating: 4.2, userRatingCount: 145 },

  // GYM/FITNESS - TP.HCM
  { placeId: 'gym_q1_01', displayName: 'Gym California', formattedAddress: '10 Hàm Nghi, Quận 1, TP.HCM', phone: '0921112222', websiteUri: 'https://caligym.vn', googleMapsUri: 'https://maps.google.com/?cid=gym01', rating: 4.3, userRatingCount: 678 },
  { placeId: 'gym_q3_01', displayName: 'Gym Elite Fitness', formattedAddress: '20 Võ Thị Sáu, Quận 3, TP.HCM', phone: '0922223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=gym02', rating: 4.0, userRatingCount: 234 },
  { placeId: 'gym_q7_01', displayName: 'Gym The New Me', formattedAddress: '30 Nguyễn Hữu Thọ, Quận 7, TP.HCM', phone: '0923334444', websiteUri: 'https://thenewme.vn', googleMapsUri: 'https://maps.google.com/?cid=gym03', rating: 4.6, userRatingCount: 345 },
  { placeId: 'gym_gvap_01', displayName: 'Gym Thái Sơn', formattedAddress: '40 Quang Trung, Gò Vấp, TP.HCM', phone: '0924445555', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=gym04', rating: 3.8, userRatingCount: 123 },
  { placeId: 'gym_td_01', displayName: 'Gym Thủ Đức', formattedAddress: '50 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0925556666', websiteUri: 'https://gymthuduc.com', googleMapsUri: 'https://maps.google.com/?cid=gym05', rating: 4.1, userRatingCount: 89 },

  // HÓA ĐƠN ĐIỆN TỬ / KẾ TOÁN - TP.HCM
  { placeId: 'acc_q1_01', displayName: 'Công ty Hóa đơn điện tử VNPT', formattedAddress: '15 Lê Lai, Quận 1, TP.HCM', phone: '0931112222', websiteUri: 'https://vnpt-invoice.vn', googleMapsUri: 'https://maps.google.com/?cid=acc01', rating: 4.2, userRatingCount: 456 },
  { placeId: 'acc_q3_01', displayName: 'Kế toán Thuận An', formattedAddress: '25 Trương Định, Quận 3, TP.HCM', phone: '0932223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=acc02', rating: 4.0, userRatingCount: 67 },
  { placeId: 'acc_q7_01', displayName: 'Hóa đơn điện tử MISA', formattedAddress: '35 Nguyễn Văn Linh, Quận 7, TP.HCM', phone: '0933334444', websiteUri: 'https://misa.vn', googleMapsUri: 'https://maps.google.com/?cid=acc03', rating: 4.5, userRatingCount: 890 },
  { placeId: 'acc_tanphu_01', displayName: 'Kế toán Trí Tuệ', formattedAddress: '45 Âu Cơ, Tân Phú, TP.HCM', phone: '0934445555', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=acc04', rating: 3.9, userRatingCount: 34 },
  { placeId: 'acc_bthanh_01', displayName: 'Dịch vụ Hóa đơn điện tử EasyInvoice', formattedAddress: '55 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM', phone: '0935556666', websiteUri: 'https://easyinvoice.vn', googleMapsUri: 'https://maps.google.com/?cid=acc05', rating: 4.3, userRatingCount: 123 },

  // NHÀ HÀNG/CAFE - TP.HCM
  { placeId: 'res_q1_01', displayName: 'Nhà hàng Ngon', formattedAddress: '60 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM', phone: '0941112222', websiteUri: 'https://nhahangngon.vn', googleMapsUri: 'https://maps.google.com/?cid=res01', rating: 4.4, userRatingCount: 1234 },
  { placeId: 'res_q3_01', displayName: 'Cafe Trung Nguyên', formattedAddress: '70 Võ Văn Tần, Quận 3, TP.HCM', phone: '0942223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=res02', rating: 4.1, userRatingCount: 567 },
  { placeId: 'res_q7_01', displayName: 'Nhà hàng Hải Sản Biển Đông', formattedAddress: '80 Nguyễn Thị Thập, Quận 7, TP.HCM', phone: '0943334444', websiteUri: 'https://biendongseafood.com', googleMapsUri: 'https://maps.google.com/?cid=res03', rating: 4.6, userRatingCount: 890 },
  { placeId: 'res_gvap_01', displayName: 'Cafe Phúc Long', formattedAddress: '90 Quang Trung, Gò Vấp, TP.HCM', phone: '0944445555', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=res04', rating: 4.2, userRatingCount: 345 },
  { placeId: 'res_td_01', displayName: 'Nhà hàng Lẩu Dê', formattedAddress: '100 Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '0945556666', websiteUri: 'https://laude.vn', googleMapsUri: 'https://maps.google.com/?cid=res05', rating: 3.8, userRatingCount: 234 },

  // LUẬT / VĂN PHÒNG - TP.HCM
  { placeId: 'law_q1_01', displayName: 'Văn phòng Luật sư Thành Công', formattedAddress: '110 Lê Duẩn, Quận 1, TP.HCM', phone: '0951112222', websiteUri: 'https://thanhconglaw.vn', googleMapsUri: 'https://maps.google.com/?cid=law01', rating: 4.3, userRatingCount: 78 },
  { placeId: 'law_q3_01', displayName: 'Công ty Luật Việt An', formattedAddress: '120 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', phone: '0952223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=law02', rating: 4.0, userRatingCount: 45 },
  { placeId: 'law_q7_01', displayName: 'Văn phòng Luật sư Sài Gòn', formattedAddress: '130 Nguyễn Hữu Thọ, Quận 7, TP.HCM', phone: '0953334444', websiteUri: 'https://saigonlaw.vn', googleMapsUri: 'https://maps.google.com/?cid=law03', rating: 4.5, userRatingCount: 123 },

  // HÀ NỘI (cho test location khác)
  { placeId: 'spa_hn_01', displayName: 'Spa Hà Nội', formattedAddress: '1 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', phone: '0961112222', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=hn01', rating: 4.2, userRatingCount: 56 },
  { placeId: 'dental_hn_01', displayName: 'Nha Khoa Hà Nội', formattedAddress: '2 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', phone: '0962223333', websiteUri: 'https://nhakhoahn.vn', googleMapsUri: 'https://maps.google.com/?cid=hn02', rating: 4.4, userRatingCount: 234 },
  { placeId: 'acc_hn_01', displayName: 'Kế toán Hà Nội', formattedAddress: '3 Tràng Tiền, Hoàn Kiếm, Hà Nội', phone: '0963334444', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=hn03', rating: 4.1, userRatingCount: 89 },
  { placeId: 'gym_hn_01', displayName: 'Gym Hà Nội', formattedAddress: '4 Nguyễn Du, Hai Bà Trưng, Hà Nội', phone: '0964445555', websiteUri: 'https://gymhn.vn', googleMapsUri: 'https://maps.google.com/?cid=hn04', rating: 4.3, userRatingCount: 345 },
  { placeId: 'res_hn_01', displayName: 'Nhà hàng Hà Nội', formattedAddress: '5 Bà Triệu, Hai Bà Trưng, Hà Nội', phone: '0965556666', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=hn05', rating: 4.0, userRatingCount: 567 },

  // ĐÀ NẴNG (cho test location khác)
  { placeId: 'spa_dn_01', displayName: 'Spa Đà Nẵng', formattedAddress: '10 Bạch Đằng, Hải Châu, Đà Nẵng', phone: '0971112222', websiteUri: 'https://spadanang.vn', googleMapsUri: 'https://maps.google.com/?cid=dn01', rating: 4.5, userRatingCount: 78 },
  { placeId: 'dental_dn_01', displayName: 'Nha Khoa Đà Nẵng', formattedAddress: '20 Hùng Vương, Hải Châu, Đà Nẵng', phone: '0972223333', websiteUri: undefined, googleMapsUri: 'https://maps.google.com/?cid=dn02', rating: 4.2, userRatingCount: 123 },
  { placeId: 'acc_dn_01', displayName: 'Kế toán Đà Nẵng', formattedAddress: '30 Lê Duẩn, Hải Châu, Đà Nẵng', phone: '0973334444', websiteUri: 'https://ketoandn.vn', googleMapsUri: 'https://maps.google.com/?cid=dn03', rating: 3.9, userRatingCount: 45 },
];

function matchIndustry(query: string, place: PlaceResult): number {
  const q = query.toLowerCase();
  const name = place.displayName.toLowerCase();
  
  // Mapping từ khóa ngành
  if (q.includes('spa') || q.includes('thẩm mỹ') || q.includes('làm đẹp')) {
    return name.includes('spa') || name.includes('thẩm mỹ') || name.includes('ngọc') || name.includes('mộc') ? 3 : 0;
  }
  if (q.includes('nha khoa') || q.includes('răng') || q.includes('nha')) {
    return name.includes('nha khoa') || name.includes('nha') ? 3 : 0;
  }
  if (q.includes('gym') || q.includes('fitness') || q.includes('thể hình') || q.includes('thể dục')) {
    return name.includes('gym') || name.includes('fitness') ? 3 : 0;
  }
  if (q.includes('hóa đơn') || q.includes('kế toán') || q.includes('invoice') || q.includes('accounting') || q.includes('thuế')) {
    return name.includes('hóa đơn') || name.includes('kế toán') || name.includes('invoice') || name.includes('accounting') || name.includes('thuế') ? 3 : 0;
  }
  if (q.includes('nhà hàng') || q.includes('cafe') || q.includes('coffee') || q.includes('ẩm thực') || q.includes('restaurant')) {
    return name.includes('nhà hàng') || name.includes('cafe') || name.includes('coffee') || name.includes('lẩu') ? 3 : 0;
  }
  if (q.includes('luật') || q.includes('law') || q.includes('văn phòng') || q.includes('công ty')) {
    return name.includes('luật') || name.includes('law') || name.includes('văn phòng') || name.includes('công ty') ? 3 : 0;
  }
  
  // Default: match bất kỳ
  return 1;
}

function matchLocation(query: string, place: PlaceResult): number {
  const q = query.toLowerCase();
  const addr = place.formattedAddress?.toLowerCase() || '';
  
  if (q.includes('hà nội') || q.includes('hn')) {
    return addr.includes('hà nội') ? 3 : 0;
  }
  if (q.includes('đà nẵng') || q.includes('dn')) {
    return addr.includes('đà nẵng') ? 3 : 0;
  }
  if (q.includes('quận 1') || q.includes('q.1') || q.includes('q1')) {
    return addr.includes('quận 1') ? 3 : 0;
  }
  if (q.includes('quận 3') || q.includes('q.3') || q.includes('q3')) {
    return addr.includes('quận 3') ? 3 : 0;
  }
  if (q.includes('quận 7') || q.includes('q.7') || q.includes('q7')) {
    return addr.includes('quận 7') ? 3 : 0;
  }
  if (q.includes('tân phú') || q.includes('tan phu')) {
    return addr.includes('tân phú') ? 3 : 0;
  }
  if (q.includes('bình thạnh') || q.includes('binh thanh')) {
    return addr.includes('bình thạnh') ? 3 : 0;
  }
  if (q.includes('gò vấp') || q.includes('go vap')) {
    return addr.includes('gò vấp') ? 3 : 0;
  }
  if (q.includes('phú nhuận') || q.includes('phu nhuan')) {
    return addr.includes('phú nhuận') ? 3 : 0;
  }
  if (q.includes('thủ đức') || q.includes('thu duc') || q.includes('thủ đức')) {
    return addr.includes('thủ đức') ? 3 : 0;
  }
  if (q.includes('hồ chí minh') || q.includes('tp.hcm') || q.includes('saigon') || q.includes('sài gòn')) {
    return addr.includes('tp.hcm') || addr.includes('hồ chí minh') ? 2 : 0;
  }
  
  // Default: match bất kỳ địa điểm
  return addr.includes('tp.hcm') || addr.includes('hà nội') || addr.includes('đà nẵng') ? 1 : 0;
}

export class MockPlacesProvider implements PlacesProvider {
  async search({ query, maxResults }: { query: string; maxResults: number }): Promise<PlaceResult[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Score and sort all places by relevance
    const scored = MOCK_DATABASE.map((place) => ({
      place,
      score: matchIndustry(query, place) + matchLocation(query, place),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Filter out zero-score results if we have enough better matches
    const filtered = scored.filter((s) => s.score > 0);
    const results = (filtered.length >= maxResults ? filtered : scored)
      .slice(0, maxResults)
      .map((s) => s.place);

    return results;
  }
}
