// Servicio de usuarios MOCK para testing temporal

const mockUsers = [
  {
    id: '1',
    name: 'Cliente de Prueba',
    email: 'cliente@test.com',
    phone: '+54 11 1234-5678',
    role: 'cliente',
    status: 'activo',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getUsers = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 50));

  let filteredUsers = [...mockUsers];

  if (filters.status) {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }

  if (filters.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role);
  }

  if (filters.name) {
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(filters.name.toLowerCase())
    );
  }

  if (filters.email) {
    filteredUsers = filteredUsers.filter(user =>
      user.email.toLowerCase().includes(filters.email.toLowerCase())
    );
  }

  return filteredUsers;
};

export const getUserById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 30));
  return mockUsers.find(user => user.id === id) || null;
};

export const getUserByEmail = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 30));
  return mockUsers.find(user => user.email === email) || null;
};

export const createUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  // Verificar si ya existe
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('Ya existe un usuario con ese email');
  }

  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockUsers.push(newUser);
  return newUser;
};

export const updateUser = async (id, userData) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar email único si se está cambiando
  if (userData.email) {
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser && existingUser.id !== id) {
      throw new Error('Ya existe otro usuario con ese email');
    }
  }

  mockUsers[index] = {
    ...mockUsers[index],
    ...userData,
    updatedAt: new Date()
  };

  return true;
};

export const deleteUser = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const index = mockUsers.findIndex(user => user.id === id);
  if (index === -1) {
    throw new Error('Usuario no encontrado');
  }

  mockUsers[index].status = 'inactivo';
  mockUsers[index].updatedAt = new Date();

  return true;
};

export const getUserStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    total: mockUsers.length,
    activos: mockUsers.filter(u => u.status === 'activo').length,
    inactivos: mockUsers.filter(u => u.status === 'inactivo').length,
    clientes: mockUsers.filter(u => u.role === 'cliente').length,
    admins: mockUsers.filter(u => u.role === 'admin').length
  };
};