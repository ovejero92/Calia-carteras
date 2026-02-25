// Servicio de ventas MOCK para testing temporal

const mockSales = [];

let saleCounter = 1;

export const createSale = async (saleData) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const newSale = {
    id: Date.now().toString(),
    ...saleData,
    saleNumber: `V${new Date().getFullYear()}000${saleCounter++}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockSales.push(newSale);
  return newSale;
};

export const getSales = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 50));

  let filteredSales = [...mockSales];

  if (filters.status) {
    filteredSales = filteredSales.filter(sale => sale.status === filters.status);
  }

  if (filters.paymentMethod) {
    filteredSales = filteredSales.filter(sale => sale.paymentMethod === filters.paymentMethod);
  }

  if (filters.userId) {
    filteredSales = filteredSales.filter(sale => sale.userId === filters.userId);
  }

  // Ordenar por fecha más reciente
  filteredSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return filteredSales.slice(0, 100);
};

export const getSaleById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 30));
  return mockSales.find(sale => sale.id === id) || null;
};

export const updateSale = async (id, saleData) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = mockSales.findIndex(sale => sale.id === id);
  if (index === -1) {
    throw new Error('Venta no encontrada');
  }

  mockSales[index] = {
    ...mockSales[index],
    ...saleData,
    updatedAt: new Date()
  };

  return true;
};

export const deleteSale = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = mockSales.findIndex(sale => sale.id === id);
  if (index === -1) {
    throw new Error('Venta no encontrada');
  }

  mockSales.splice(index, 1);
  return true;
};

export const getSaleStats = async (startDate = null, endDate = null) => {
  await new Promise(resolve => setTimeout(resolve, 50));

  let sales = mockSales.filter(sale => sale.status === 'completada');

  // Filtrar por fecha si se proporciona
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    sales = sales.filter(sale => new Date(sale.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    sales = sales.filter(sale => new Date(sale.createdAt) <= end);
  }

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
  const totalItems = sales.reduce((sum, sale) => {
    if (!sale.items) return sum;
    return sum + sale.items.reduce((itemSum, item) => itemSum + (parseInt(item.quantity) || 0), 0);
  }, 0);

  // Productos más vendidos
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5);

  // Ventas por método de pago
  const paymentMethods = {};
  sales.forEach(sale => {
    const method = sale.paymentMethod || 'otro';
    if (!paymentMethods[method]) {
      paymentMethods[method] = { count: 0, total: 0 };
    }
    paymentMethods[method].count += 1;
    paymentMethods[method].total += (parseFloat(sale.total) || 0);
  });

  return {
    totalSales: totalSales || 0,
    totalRevenue: totalRevenue || 0,
    totalItems: totalItems || 0,
    averageSale: totalSales > 0 ? (totalRevenue / totalSales) : 0,
    topProducts: topProducts || [],
    paymentMethods: paymentMethods || {}
  };
};