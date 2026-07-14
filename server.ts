import { ProductsRepository } from "./server/repositories/products.repository";
import dotenv from "dotenv";
dotenv.config();

import { supabase } from "./server/config/supabase";
import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_BRANDS, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS 
} from './server/initialData';
import { User, Product, Brand, Category, Order, Notification, MotoModel } from './src/types';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'impormot-secret-2026';
const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for the persistent JSON database
interface DatabaseSchema {
  users: User[];
  products: Product[];
  brands: Brand[];
  partBrands?: Brand[];
  categories: Category[];
  orders: Order[];
  notifications: Notification[];
  motoModels?: MotoModel[];
}

// Global Database State Handler
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.partBrands) {
        parsed.partBrands = [
          { id: 'pb-1', name: 'Yamasida', slug: 'yamasida' },
          { id: 'pb-2', name: 'Brembo', slug: 'brembo' },
          { id: 'pb-3', name: 'Motul', slug: 'motul' },
          { id: 'pb-4', name: 'K&N', slug: 'kn' },
          { id: 'pb-5', name: 'Akrapovic', slug: 'akrapovic' },
          { id: 'pb-6', name: 'LS2', slug: 'ls2' },
          { id: 'pb-7', name: 'Alpinestars', slug: 'alpinestars' },
          { id: 'pb-8', name: 'Yuasa', slug: 'yuasa' },
          { id: 'pb-9', name: 'Far', slug: 'far' },
          { id: 'pb-10', name: 'Positron', slug: 'positron' },
          { id: 'pb-11', name: 'LED-MOTO', slug: 'led-moto' },
          { id: 'pb-12', name: 'Promoto', slug: 'promoto' }
        ];
        updated = true;
      }
      if (!parsed.motoModels) {
        parsed.motoModels = [
          { id: 'mm-1', name: 'Honda Wave 110S' },
          { id: 'mm-2', name: 'Honda CG 150 Titan' },
          { id: 'mm-3', name: 'Yamaha YBR 125' },
          { id: 'mm-4', name: 'Yamaha FZ FI' },
          { id: 'mm-5', name: 'Bajaj Rouser NS 200' },
          { id: 'mm-6', name: 'Honda XR 150L' },
          { id: 'mm-7', name: 'Corven Energy 110' },
          { id: 'mm-8', name: 'Motomel S2 150' }
        ];
        updated = true;
      }
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error reading db.json, recreating with defaults...', error);
  }

  // Seeding the db.json file
  const salt = bcrypt.genSaltSync(10);
  const defaultAdminPasswordHash = bcrypt.hashSync('admin', salt);
  const defaultUserPasswordHash = bcrypt.hashSync('user123', salt);

  const initialDb: DatabaseSchema = {
    users: [
      {
        id: 'admin-1',
        email: 'admin@impormot.com',
        passwordHash: defaultAdminPasswordHash,
        name: 'Administrador',
        lastName: 'IMPORMOT',
        phone: '+54 9 2226524373',
        address: 'Del Carmen 1073',
        city: 'Cañuelas',
        state: 'Buenos Aires',
        zipCode: '1814',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-1',
        email: 'user@impormot.com',
        passwordHash: defaultUserPasswordHash,
        name: 'Nahuel',
        lastName: 'Santos',
        phone: '+54 9 11 1234-5678',
        address: 'Av. del Libertador 4500',
        city: 'CABA',
        state: 'Buenos Aires',
        zipCode: '1426',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ],
    products: INITIAL_PRODUCTS,
    brands: INITIAL_BRANDS,
    partBrands: [
      { id: 'pb-1', name: 'Yamasida', slug: 'yamasida' },
      { id: 'pb-2', name: 'Brembo', slug: 'brembo' },
      { id: 'pb-3', name: 'Motul', slug: 'motul' },
      { id: 'pb-4', name: 'K&N', slug: 'kn' },
      { id: 'pb-5', name: 'Akrapovic', slug: 'akrapovic' },
      { id: 'pb-6', name: 'LS2', slug: 'ls2' },
      { id: 'pb-7', name: 'Alpinestars', slug: 'alpinestars' },
      { id: 'pb-8', name: 'Yuasa', slug: 'yuasa' },
      { id: 'pb-9', name: 'Far', slug: 'far' },
      { id: 'pb-10', name: 'Positron', slug: 'positron' },
      { id: 'pb-11', name: 'LED-MOTO', slug: 'led-moto' },
      { id: 'pb-12', name: 'Promoto', slug: 'promoto' }
    ],
    categories: INITIAL_CATEGORIES,
    orders: INITIAL_ORDERS,
    notifications: [
      {
        id: 'notif-1',
        userId: 'user-1',
        title: '¡Descuento Especial en Tu Filtro Favorito!',
        content: 'El Filtro de Aceite K&N para tu Honda XR150 ahora tiene un 10% de descuento. ¡Aprovechalo!',
        type: 'promo',
        date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        title: 'Pedido Preparándose',
        content: 'Tu pedido ORD-1001 se encuentra en proceso de preparación. Pronto será despachado.',
        type: 'order',
        date: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        read: false
      },
      {
        id: 'notif-3',
        title: 'Nuevos ingresos Brembo',
        content: 'Ingresó la nueva línea de pastillas de freno Brembo Carbon-Ceramic de alta competición.',
        type: 'promo',
        date: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        read: false
      }
    ],
    motoModels: [
      { id: 'mm-1', name: 'Honda Wave 110S' },
      { id: 'mm-2', name: 'Honda CG 150 Titan' },
      { id: 'mm-3', name: 'Yamaha YBR 125' },
      { id: 'mm-4', name: 'Yamaha FZ FI' },
      { id: 'mm-5', name: 'Bajaj Rouser NS 200' },
      { id: 'mm-6', name: 'Honda XR 150L' },
      { id: 'mm-7', name: 'Corven Energy 110' },
      { id: 'mm-8', name: 'Motomel S2 150' }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing db.json:', error);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Ensure database exists and is loaded
  let db = loadDatabase();

  // Authentication Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido.' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
      }
      req.user = user;
      next();
    });
  };

  // Admin Verification Middleware
  const verifyAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
      }
    });
  };

  // ----------------------------------------------------
  // AUTHENTICATION ENDPOINTS
  // ----------------------------------------------------

  // Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, name, lastName, phone, address, city, state, zipCode } = req.body;

      if (!email || !password || !name || !lastName) {
        return res.status(400).json({ error: 'Campos requeridos faltantes: email, contraseña, nombre y apellido.' });
      }

      db = loadDatabase();
      const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newUser: User = {
        id: 'user-' + Date.now(),
        email: email.toLowerCase(),
        passwordHash,
        name,
        lastName,
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDatabase(db);

      // Sign Token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const { passwordHash: _, ...userProfile } = newUser;
      res.status(201).json({ token, user: userProfile });
    } catch (err: any) {
      res.status(500).json({ error: 'Error del servidor durante el registro: ' + err.message });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
      }

      db = loadDatabase();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const validPassword = bcrypt.compareSync(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      const { passwordHash: _, ...userProfile } = user;
      res.json({ token, user: userProfile });
    } catch (err: any) {
      res.status(500).json({ error: 'Error del servidor durante el inicio de sesión.' });
    }
  });

  // Me Profile
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    db = loadDatabase();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    const { passwordHash: _, ...userProfile } = user;
    res.json(userProfile);
  });

  // Update Profile
  app.put('/api/auth/profile', authenticateToken, (req: any, res) => {
    try {
      const { name, lastName, phone, address, city, state, zipCode, password } = req.body;
      db = loadDatabase();
      const idx = db.users.findIndex(u => u.id === req.user.id);

      if (idx === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const user = db.users[idx];
      if (name) user.name = name;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (city !== undefined) user.city = city;
      if (state !== undefined) user.state = state;
      if (zipCode !== undefined) user.zipCode = zipCode;

      if (password) {
        const salt = bcrypt.genSaltSync(10);
        user.passwordHash = bcrypt.hashSync(password, salt);
      }

      db.users[idx] = user;
      saveDatabase(db);

      const { passwordHash: _, ...updatedProfile } = user;
      res.json(updatedProfile);
    } catch (err: any) {
      res.status(500).json({ error: 'Error actualizando el perfil.' });
    }
  });

  // ----------------------------------------------------
  // PRODUCTS ENDPOINTS
  // ----------------------------------------------------

  // Get Products with Query Parameters for Filtering
  app.get('/api/products', async (req, res) => {
  try {

    const repository = new ProductsRepository();

    let filtered = await repository.getAll();

    const { search, brand, category, displacement, motoModel } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();

      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.compatibleModels.some(model => model.toLowerCase().includes(q))
      );
    }

    if (brand) {
      const b = (brand as string).toLowerCase();

      filtered = filtered.filter(p =>
        p.brand.toLowerCase() === b ||
        p.compatibleMotos.some(m => m.toLowerCase() === b)
      );
    }

    if (category) {
      const c = (category as string).toLowerCase();

      filtered = filtered.filter(
        p => p.category.toLowerCase() === c
      );
    }

    if (displacement) {
      const d = (displacement as string).toLowerCase();

      filtered = filtered.filter(p =>
        p.compatibleDisplacements.some(disp =>
          disp.toLowerCase().includes(d)
        )
      );
    }

    if (motoModel) {
      const mm = (motoModel as string).toLowerCase();

      filtered = filtered.filter(p =>
        p.compatibleModels.some(model =>
          model.toLowerCase().includes(mm)
        )
      );
    }

    res.json(filtered);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error obteniendo catálogo de productos."
    });

  }
});

      // Generate up to 4 related products in the same category or brand
      const related = db.products
        .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
        .slice(0, 4);

      res.json({ product, related });
    } catch (err) {
      res.status(500).json({ error: 'Error cargando detalles del producto.' });
    }
  });

  // Create Product (Admin Only)
  app.post('/api/products', verifyAdmin, (req, res) => {
    try {
      const { name, sku, brand, price, offerPrice, stock, category, description, images, specs, tags, compatibleMotos, compatibleModels, compatibleDisplacements } = req.body;

      if (!name || !sku || !brand || !price || !category) {
        return res.status(400).json({ error: 'Campos obligatorios incompletos.' });
      }

      db = loadDatabase();

      if (db.products.some(p => p.sku === sku)) {
        return res.status(400).json({ error: `El producto con SKU: ${sku} ya existe.` });
      }

      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        name,
        sku,
        brand,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : undefined,
        stock: Number(stock !== undefined ? stock : 0),
        category,
        description: description || '',
        images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'],
        specs: specs || {},
        tags: Array.isArray(tags) ? tags : [],
        compatibleMotos: Array.isArray(compatibleMotos) ? compatibleMotos : [],
        compatibleModels: Array.isArray(compatibleModels) ? compatibleModels : [],
        compatibleDisplacements: Array.isArray(compatibleDisplacements) ? compatibleDisplacements : []
      };

      db.products.push(newProduct);
      saveDatabase(db);

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Error al agregar producto.' });
    }
  });

  // Edit Product (Admin Only)
  app.put('/api/products/:id', verifyAdmin, (req, res) => {
    try {
      const { name, sku, brand, price, offerPrice, stock, category, description, images, specs, tags, compatibleMotos, compatibleModels, compatibleDisplacements } = req.body;
      db = loadDatabase();

      const idx = db.products.findIndex(p => p.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      const original = db.products[idx];

      // Update fields
      if (name) original.name = name;
      if (sku) original.sku = sku;
      if (brand) original.brand = brand;
      if (price !== undefined) original.price = Number(price);
      original.offerPrice = offerPrice ? Number(offerPrice) : undefined;
      if (stock !== undefined) original.stock = Number(stock);
      if (category) original.category = category;
      if (description !== undefined) original.description = description;
      if (Array.isArray(images)) original.images = images;
      if (specs) original.specs = specs;
      if (Array.isArray(tags)) original.tags = tags;
      if (Array.isArray(compatibleMotos)) original.compatibleMotos = compatibleMotos;
      if (Array.isArray(compatibleModels)) original.compatibleModels = compatibleModels;
      if (Array.isArray(compatibleDisplacements)) original.compatibleDisplacements = compatibleDisplacements;

      db.products[idx] = original;
      saveDatabase(db);

      res.json(original);
    } catch (err) {
      res.status(500).json({ error: 'Error al editar producto.' });
    }
  });

  // Delete Product (Admin Only)
  app.delete('/api/products/:id', verifyAdmin, (req, res) => {
    try {
      db = loadDatabase();
      const initialLength = db.products.length;
      db.products = db.products.filter(p => p.id !== req.params.id);

      if (db.products.length === initialLength) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      saveDatabase(db);
      res.json({ message: 'Producto eliminado correctamente.' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar producto.' });
    }
  });

  // ----------------------------------------------------
  // BRANDS & CATEGORIES CRUD ENDPOINTS
  // ----------------------------------------------------

  // Brands
  app.get('/api/brands', (req, res) => {
    db = loadDatabase();
    res.json(db.brands);
  });

  app.post('/api/brands', verifyAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    db = loadDatabase();
    const newBrand: Brand = {
      id: 'brand-' + Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    db.brands.push(newBrand);
    saveDatabase(db);
    res.status(201).json(newBrand);
  });

  app.put('/api/brands/:id', verifyAdmin, (req, res) => {
    const { name } = req.body;
    db = loadDatabase();
    const brand = db.brands.find(b => b.id === req.params.id);
    if (!brand) return res.status(404).json({ error: 'Marca no encontrada.' });
    if (name) {
      brand.name = name;
      brand.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    saveDatabase(db);
    res.json(brand);
  });

  app.delete('/api/brands/:id', verifyAdmin, (req, res) => {
    db = loadDatabase();
    db.brands = db.brands.filter(b => b.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: 'Marca eliminada con éxito.' });
  });

  // Part Brands (Marcas de repuestos)
  app.get('/api/part-brands', (req, res) => {
    db = loadDatabase();
    res.json(db.partBrands || []);
  });

  app.post('/api/part-brands', verifyAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    db = loadDatabase();
    if (!db.partBrands) db.partBrands = [];
    const newPartBrand: Brand = {
      id: 'pb-' + Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    db.partBrands.push(newPartBrand);
    saveDatabase(db);
    res.status(201).json(newPartBrand);
  });

  app.delete('/api/part-brands/:id', verifyAdmin, (req, res) => {
    db = loadDatabase();
    if (!db.partBrands) db.partBrands = [];
    db.partBrands = db.partBrands.filter(b => b.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: 'Marca de repuesto eliminada con éxito.' });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    db = loadDatabase();
    res.json(db.categories);
  });

  app.post('/api/categories', verifyAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    db = loadDatabase();
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    db.categories.push(newCategory);
    saveDatabase(db);
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', verifyAdmin, (req, res) => {
    const { name } = req.body;
    db = loadDatabase();
    const category = db.categories.find(c => c.id === req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });
    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    saveDatabase(db);
    res.json(category);
  });

  app.delete('/api/categories/:id', verifyAdmin, (req, res) => {
    db = loadDatabase();
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: 'Categoría eliminada con éxito.' });
  });

  // Motorcycle Models Endpoints
  app.get('/api/moto-models', (req, res) => {
    db = loadDatabase();
    res.json(db.motoModels || []);
  });

  app.post('/api/moto-models', verifyAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio.' });
    db = loadDatabase();
    if (!db.motoModels) db.motoModels = [];
    const newMotoModel: MotoModel = {
      id: 'mm-' + Date.now(),
      name
    };
    db.motoModels.push(newMotoModel);
    saveDatabase(db);
    res.status(201).json(newMotoModel);
  });

  app.delete('/api/moto-models/:id', verifyAdmin, (req, res) => {
    db = loadDatabase();
    if (!db.motoModels) db.motoModels = [];
    db.motoModels = db.motoModels.filter(m => m.id !== req.params.id);
    saveDatabase(db);
    res.json({ message: 'Modelo de moto eliminado con éxito.' });
  });

  // ----------------------------------------------------
  // ORDERS ENDPOINTS (Registered & Guest Checkout)
  // ----------------------------------------------------

  // Get Orders (Admin gets all, Users get theirs)
  app.get('/api/orders', authenticateToken, (req: any, res) => {
    try {
      db = loadDatabase();
      if (req.user.role === 'admin') {
        res.json(db.orders);
      } else {
        const userOrders = db.orders.filter(o => o.userId === req.user.id);
        res.json(userOrders);
      }
    } catch (err) {
      res.status(500).json({ error: 'Error cargando órdenes.' });
    }
  });

  // Place Order (Guest or registered user)
  app.post('/api/orders', (req, res) => {
    try {
      const { 
        userId, 
        isGuest, 
        customerName, 
        customerLastName, 
        customerEmail, 
        customerPhone, 
        address, 
        city, 
        state, 
        zipCode, 
        items, 
        total,
        notes 
      } = req.body;

      if (!customerName || !customerPhone || !address || !items || !items.length) {
        return res.status(400).json({ error: 'Faltan datos de envío o productos en el carrito.' });
      }

      db = loadDatabase();

      // Verify and deduct stock
      const stockCheckFailed: string[] = [];
      items.forEach((item: any) => {
        const dbProd = db.products.find(p => p.id === item.productId);
        if (!dbProd || dbProd.stock < item.quantity) {
          stockCheckFailed.push(item.name);
        }
      });

      if (stockCheckFailed.length > 0) {
        return res.status(400).json({ 
          error: `Stock insuficiente para los siguientes productos: ${stockCheckFailed.join(', ')}.` 
        });
      }

      // Deduct stock
      items.forEach((item: any) => {
        const dbProd = db.products.find(p => p.id === item.productId);
        if (dbProd) {
          dbProd.stock -= item.quantity;
        }
      });

      // Generate Order ID
      const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

      const newOrder: Order = {
        id: orderId,
        userId: isGuest ? undefined : userId,
        isGuest: !!isGuest,
        customerName,
        customerLastName: customerLastName || '',
        customerEmail: customerEmail || '',
        customerPhone,
        address,
        city,
        state,
        zipCode: zipCode || '',
        items,
        total: Number(total),
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
        notes: notes || ''
      };

      db.orders.push(newOrder);

      // Create Server Trigger Notification for the User or Admin
      const newNotification: Notification = {
        id: 'notif-' + Date.now(),
        userId: isGuest ? undefined : userId,
        title: `Pedido Recibido: ${orderId}`,
        content: `Hemos recibido tu orden y se encuentra en estado 'Pendiente'. Total: $${Number(total).toLocaleString('es-AR')}.`,
        type: 'order',
        date: new Date().toISOString(),
        read: false
      };
      db.notifications.push(newNotification);

      saveDatabase(db);

      // Generate WhatsApp Link
      // Direct correlation structure matching products chosen, quantities, price & coordinates
      const itemsString = items.map((i: any) => `• ${i.name} (x${i.quantity}) - $${(i.price * i.quantity).toLocaleString('es-AR')}`).join('\n');
      const waText = `🏍️ *Nuevo Pedido IMPORMOT [${orderId}]* 🏍️\n\n` +
        `👤 *Cliente:* ${customerName} ${customerLastName || ''}\n` +
        `📞 *Teléfono:* ${customerPhone}\n` +
        `📍 *Dirección:* ${address}, ${city}, ${state}\n\n` +
        `📦 *Productos:* \n${itemsString}\n\n` +
        `💰 *Total:* $${Number(total).toLocaleString('es-AR')}\n` +
        `💬 *Notas:* ${notes || 'Sin aclaraciones'}\n\n` +
        `📌 _¡Hola IMPORMOT! Quiero coordinar la entrega y el pago de mi pedido._`;

      const encodedText = encodeURIComponent(waText);
      const whatsappUrl = `https://wa.me/5492226524373?text=${encodedText}`; // Official store contact number

      res.status(201).json({ order: newOrder, whatsappUrl });
    } catch (err: any) {
      res.status(500).json({ error: 'Error procesando tu orden: ' + err.message });
    }
  });

  // Update order status (Admin Only)
  app.put('/api/orders/:id/status', verifyAdmin, (req, res) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'El estado es obligatorio.' });

      db = loadDatabase();
      const order = db.orders.find(o => o.id === req.params.id);

      if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

      order.status = status;

      // Add user notification if order has a userId linked to registered profile
      if (order.userId) {
        const notif: Notification = {
          id: 'notif-' + Date.now(),
          userId: order.userId,
          title: `Tu pedido ${order.id} cambió de estado`,
          content: `Tu pedido ahora está: '${status}'. Puedes ver el historial de compras para más detalles o comunicarte con nosotros.`,
          type: 'order',
          date: new Date().toISOString(),
          read: false
        };
        db.notifications.push(notif);
      }

      saveDatabase(db);
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Error actualizando estado del pedido.' });
    }
  });

  // ----------------------------------------------------
  // NOTIFICATIONS ENDPOINTS
  // ----------------------------------------------------

  // Get notifications
  app.get('/api/notifications', (req, res) => {
    try {
      db = loadDatabase();
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      // If no token or invalid user, return only global promo/system notifications (marked as read: false)
      if (!token) {
        const globals = db.notifications.filter(n => !n.userId);
        return res.json(globals);
      }

      jwt.verify(token, JWT_SECRET, (err: any, tokenUser: any) => {
        if (err) {
          const globals = db.notifications.filter(n => !n.userId);
          return res.json(globals);
        }
        // Auth success: return globals + user specific
        const filtered = db.notifications.filter(n => !n.userId || n.userId === tokenUser.id);
        res.json(filtered);
      });
    } catch (err) {
      res.status(500).json({ error: 'Error al recuperar notificaciones.' });
    }
  });

  // Mark notification as read
  app.post('/api/notifications/read/:id', (req, res) => {
    db = loadDatabase();
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // ADMIN PANEL STATISTICS DIRECT COUPLING
  // ----------------------------------------------------
  app.get('/api/admin/metrics', verifyAdmin, (req, res) => {
    try {
      db = loadDatabase();

      const totalSales = db.orders
        .filter(o => o.status !== 'Cancelado')
        .reduce((sum, o) => sum + o.total, 0);

      const totalOrdersCount = db.orders.length;
      const totalProductsCount = db.products.length;
      const totalUsersCount = db.users.filter(u => u.role !== 'admin').length;

      // Sales progress array matching recent order totals grouped by month/date
      const recentSalesTrends = db.orders
        .filter(o => o.status !== 'Cancelado')
        .slice(-6)
        .map(o => ({
          date: new Date(o.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
          total: o.total,
          id: o.id
        }));

      // Top Selling Products counts calculation
      const productSalesCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
      db.orders
        .filter(o => o.status !== 'Cancelado')
        .forEach(o => {
          o.items.forEach(item => {
            if (!productSalesCounts[item.productId]) {
              productSalesCounts[item.productId] = {
                name: item.name,
                quantity: 0,
                revenue: 0
              };
            }
            productSalesCounts[item.productId].quantity += item.quantity;
            productSalesCounts[item.productId].revenue += item.price * item.quantity;
          });
        });

      const topSellingProducts = Object.values(productSalesCounts)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      res.json({
        totalSales,
        totalOrdersCount,
        totalProductsCount,
        totalUsersCount,
        recentSalesTrends,
        topSellingProducts
      });
    } catch (err) {
      res.status(500).json({ error: 'Error al recuperar métricas de administración.' });
    }
  });

  // Get all users (Admin only)
  app.get('/api/admin/users', verifyAdmin, (req, res) => {
    try {
      db = loadDatabase();
      // Send users without their password hashes for safety
      const safeUsers = db.users.map(u => {
        const { passwordHash, ...userWithoutPassword } = u as any;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (err) {
      res.status(500).json({ error: 'Error al recuperar usuarios.' });
    }
  });

  // Update user role (Admin only)
  app.put('/api/admin/users/:id/role', verifyAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ error: 'Rol inválido. Debe ser "admin" o "user".' });
      }

      db = loadDatabase();
      const userIndex = db.users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      db.users[userIndex].role = role;
      saveDatabase(db);

      res.json({ success: true, user: db.users[userIndex] });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el rol de usuario.' });
    }
  });

  // Delete user (Admin only)
  app.delete('/api/admin/users/:id', verifyAdmin, (req: any, res: any) => {
    try {
      const { id } = req.params;

      if (req.user && req.user.id === id) {
        return res.status(400).json({ error: 'No podés eliminar tu propia cuenta de administrador.' });
      }

      db = loadDatabase();
      const userIndex = db.users.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      db.users.splice(userIndex, 1);
      saveDatabase(db);

      res.json({ success: true, message: 'Usuario eliminado con éxito.' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar el usuario.' });
    }
  });

  // SEO sitemap dynamic router
  app.get('/sitemap.xml', (req, res) => {
    db = loadDatabase();
    res.header('Content-Type', 'application/xml');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add main pages
    xml += `  <url><loc>https://impormot.com/</loc><priority>1.00</priority></url>\n`;
    xml += `  <url><loc>https://impormot.com/productos</loc><priority>0.80</priority></url>\n`;
    
    // Dynamic products
    db.products.forEach(p => {
      xml += `  <url><loc>https://impormot.com/productos/${p.id}</loc><priority>0.64</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.send(xml);
  });

  // ----------------------------------------------------
  // VITE DEV SERVER / STATIC PRODUCTION FALLBACK
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in Development Mode');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in Production Mode');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server executing live on: http://localhost:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Fatal initialization error:', e);
});
