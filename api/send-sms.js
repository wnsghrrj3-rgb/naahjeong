import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { bookingNum, name, phone, site, checkin, checkout, guests, dogs, amount, car, request, directPhone, directMsg } = req.body;

  // 관리자에서 직접 전송
  const toPhone = directPhone ? directPhone.replace(/-/g, '') : '01088073372';
  const msg = directMsg || `[나아정] 새 예약 신청
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

  // 솔라피 인증
  const API_KEY = 'NCSE9GJV7PMIPKWN';
  const API_SECRET = 'UZTGRWZCB8BUROVHBWU2GL62YYXRNYXS';
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2);
  const hmac = crypto.createHmac('sha256', API_SECRET);
  hmac.update(date + salt);
  const signature = hmac.digest('hex');

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 apiKey=${API_KEY}, date=${date}, salt=${salt}, signature=${signature}`
      },
      body: JSON.stringify({
        message: {
          to: toPhone,
          from: '01088073372',
          text: msg,
          type: 'LMS'
        }
      })
    });

    const data = await response.json();
    console.log('솔라피 응답:', JSON.stringify(data));

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: data.errorMessage || '발송 실패' });
    }
  } catch (error) {
    console.error('SMS 오류:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
