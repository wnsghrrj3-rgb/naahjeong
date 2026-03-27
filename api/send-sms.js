export default async function handler(req, res) {
  // CORS 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingNum, name, phone, site, checkin, checkout, guests, dogs, amount, car, request } = req.body;

  // 문자 내용 작성
  const msg = `[나아정] 새 예약 신청
예약번호: ${bookingNum}
예약자: ${name} (${phone})
사이트: ${site}
입실: ${checkin}
퇴실: ${checkout}
인원: ${guests}
반려견: ${dogs}
결제금액: ${amount}
차량: ${car || '없음'}
요청사항: ${request || '없음'}
※ 24시간내 입금확인 후 확정`;

  // 알리고 API 호출
  const params = new URLSearchParams();
  params.append('key', 'sttrvg53ifp27dm222m22oqzul7qsgv1');
  params.append('user_id', 'wnsghrrj');
  params.append('sender', '01088073372');
  params.append('receiver', '01088073372'); // 운영자 수신번호
  params.append('msg', msg);
  params.append('msg_type', 'LMS');

  try {
    const response = await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json();
    console.log('알리고 응답:', data);

    if (data.result_code === 1 || data.result_code === '1') {
      return res.status(200).json({ success: true, message: '문자 발송 성공' });
    } else {
      return res.status(500).json({ success: false, message: data.message });
    }
  } catch (error) {
    console.error('SMS 발송 오류:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
