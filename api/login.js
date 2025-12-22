import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // Chỉ chấp nhận method POST (gửi dữ liệu lên)
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = request.body;

  if (!username || !password) {
    return response.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' });
  }

  try {
    // Truy vấn database để tìm người dùng
    // Giả sử bảng của bạn tên là "Users" và có cột "username", "password"
    const result = await sql`
      SELECT * FROM Users_ai_images 
      WHERE username = ${username} AND password = ${password};
    `;

    // Nếu tìm thấy ít nhất 1 dòng trùng khớp
    if (result.rowCount > 0) {
      return response.status(200).json({ success: true });
    } else {
      return response.status(401).json({ success: false, message: 'Sai thông tin' });
    }

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Lỗi server nội bộ', details: error.message });
  }
}