// Script simple para probar la conexión al backend
async function testConnection() {
  try {
    console.log('🧪 Probando conexión al backend...');
    const response = await fetch('http://localhost:3001/api/products');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Backend conectado exitosamente!');
    console.log('📦 Productos encontrados:', data.data.length);
    console.log('📋 Primer producto:', data.data[0]?.name);
  } catch (error) {
    console.error('❌ Error conectando al backend:', error.message);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
      console.error('💡 El backend no está corriendo en http://localhost:3001');
      console.error('💡 Ejecuta: cd backend && npm start');
    }
  }
}

testConnection();