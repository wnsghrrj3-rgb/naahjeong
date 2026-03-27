export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingNum, name, phone, site, checkin, checkout, guests, dogs, amount, car, request } = req.body;

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
요청: ${request || '없음'}
※ 24시간내 입금확인 후 확정`;

  // Vercel 실제 발신 IP 로그 출력
  const xForwardedFor = req.headers['x-forwarded-for'] || '';
  const xRealIp = req.headers['x-real-ip'] || '';
  console.log('x-forwarded-for:', xForwardedFor);
  console.log('x-real-ip:', xRealIp);

  const params = new URLSearchParams();
  params.append('key', 'sttrvg53ifp27dm222m22oqzul7qsgv1');
  params.append('user_id', 'wnsghrrj');
  params.append('sender', '01088073372');
  params.append('receiver', '01088073372');
  params.append('msg', msg);
  params.append('msg_type', 'LMS');

  try {
    const response = await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json();
    console.log('알리고 응답:', JSON.stringify(data));

    if (data.result_code === 1 || data.result_code === '1') {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: data.message, xForwardedFor, xRealIp });
    }
  } catch (error) {
    console.error('SMS 오류:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
