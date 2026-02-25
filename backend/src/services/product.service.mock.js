// Servicio de productos MOCK para testing temporal
// Reemplaza las funciones de Firebase con datos en memoria

const mockProducts = [
  {
    id: '1',
    name: 'Cartera Elegante Negra',
    price: 25000,
    stock: 10,
    category: 'cartera',
    image: '/uploads/products/1766181268588-Bandolera.webp',
    characteristics: {
      Ancho: '27 cm',
      Alto: '18 cm',
      Marca: 'Amphora',
      Color: 'Negro',
      Género: 'Mujer',
      Tipo: 'Cartera'
    },
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Bolso de Cuero Marrón',
    price: 35000,
    stock: 5,
    category: 'bolso',
    image: '/uploads/products/1766181268588-Bandolera.webp',
    characteristics: {
      Ancho: '30 cm',
      Alto: '25 cm',
      Marca: 'Amphora',
      Color: 'Marrón',
      Género: 'Mujer',
      Tipo: 'Bolso'
    },
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Cartera Roja Clásica',
    price: 28000,
    stock: 8,
    category: 'cartera',
    image: '/uploads/products/1766181268588-Bandolera.webp',
    characteristics: {
      Ancho: '25 cm',
      Alto: '16 cm',
      Marca: 'Amphora',
      Color: 'Rojo',
      Género: 'Mujer',
      Tipo: 'Cartera'
    },
    createdAt: new Date()
  }
];

export const getProducts = async () => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProducts;
};

export const getProductById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockProducts.find(product => product.id === id) || null;
};

export const saveProduct = async (productData) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const newProduct = {
    id: Date.now().toString(),
    ...productData,
    createdAt: new Date()
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = mockProducts.findIndex(product => product.id === id);
  if (index !== -1) {
    mockProducts[index] = { ...mockProducts[index], ...data };
    return true;
  }
  return false;
};

export const deleteProduct = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const index = mockProducts.findIndex(product => product.id === id);
  if (index !== -1) {
    mockProducts.splice(index, 1);
    return true;
  }
  return false;
};