import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Layers, 
  CircleDollarSign, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Save, 
  X, 
  TrendingUp, 
  CheckCircle, 
  ChevronRight, 
  FileSpreadsheet, 
  RotateCcw,
  Search,
  BadgeAlert,
  ArrowUpRight,
  Wrench
} from 'lucide-react';
import { Product, Brand, Category, Order, User, OrderStatus, MotoModel } from '../types';

interface AdminDashboardProps {
  onNavigate: (view: string, extra?: any) => void;
  currentUser?: User | null;
}

export default function AdminDashboard({ onNavigate, currentUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'taxonomies' | 'users'>('stats');
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [partBrands, setPartBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [motoModels, setMotoModels] = useState<MotoModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userRoleStatus, setUserRoleStatus] = useState<Record<string, 'saving' | 'success' | 'error' | null>>({});
  const [userDeleteError, setUserDeleteError] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom non-blocking iframe-friendly deletion confirmation states
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<string | null>(null);
  const [confirmDeleteTaxonomyId, setConfirmDeleteTaxonomyId] = useState<string | null>(null);

  // Form states for Products CRUD
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Form states for Brand & Category CRUD
  const [taxonomyName, setTaxonomyName] = useState('');
  const [taxonomyType, setTaxonomyType] = useState<'brand' | 'partBrand' | 'category' | 'motoModel'>('brand');

  const fetchAllData = () => {
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    setLoading(true);

    // 1. Fetch metrics
    fetch('/api/admin/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(m => setMetrics(m))
      .catch(err => console.error(err));

    // 2. Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(p => setProducts(p))
      .catch(err => console.error(err));

    // 3. Fetch orders
    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(o => setOrders(o.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(err => console.error(err));

    // 4. Fetch brands/categories
    fetch('/api/brands')
      .then(res => res.json())
      .then(b => setBrands(b))
      .catch(err => console.error(err));

    fetch('/api/part-brands')
      .then(res => res.json())
      .then(pb => setPartBrands(pb || []))
      .catch(err => console.error(err));

    fetch('/api/categories')
      .then(res => res.json())
      .then(c => setCategories(c))
      .catch(err => console.error(err));

    fetch('/api/moto-models')
      .then(res => res.json())
      .then(mm => setMotoModels(mm || []))
      .catch(err => console.error(err));

    // 5. Fetch actual users register from API
    fetch('/api/admin/users', { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios');
        return res.json();
      })
      .then(u => {
        setUsers(u || []);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const handleUpdateUserRole = (userId: string, targetRole: 'admin' | 'user') => {
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    setUserRoleStatus(prev => ({ ...prev, [userId]: 'saving' }));

    fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: targetRole })
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo actualizar el rol del usuario.');
        return res.json();
      })
      .then(() => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
        setUserRoleStatus(prev => ({ ...prev, [userId]: 'success' }));
        setTimeout(() => {
          setUserRoleStatus(prev => ({ ...prev, [userId]: null }));
        }, 3000);
      })
      .catch(err => {
        console.error(err);
        setUserRoleStatus(prev => ({ ...prev, [userId]: 'error' }));
        setTimeout(() => {
          setUserRoleStatus(prev => ({ ...prev, [userId]: null }));
        }, 4050);
        fetchAllData();
      });
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      setUserDeleteError(prev => ({ 
        ...prev, 
        [userId]: 'No podés eliminar tu propia cuenta de administrador.' 
      }));
      setTimeout(() => {
        setUserDeleteError(prev => ({ ...prev, [userId]: null }));
      }, 5000);
      return;
    }

    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    setUserDeleteError(prev => ({ ...prev, [userId]: null }));

    fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'No se pudo eliminar al usuario.');
          });
        }
        return res.json();
      })
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== userId));
      })
      .catch(err => {
        console.error(err);
        setUserDeleteError(prev => ({ ...prev, [userId]: err.message || 'Error al eliminar el usuario.' }));
        setTimeout(() => {
          setUserDeleteError(prev => ({ ...prev, [userId]: null }));
        }, 5000);
      });
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo actualizar la orden');
        return res.json();
      })
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        fetchAllData(); // refresh dashboard metrics
      })
      .catch(err => alert(err.message));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('impormot_token');
    if (!token || !editingProduct) return;

    const method = editingProduct.id ? 'PUT' : 'POST';
    const endpoint = editingProduct.id ? `/api/products/${editingProduct.id}` : '/api/products';

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editingProduct)
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar el producto. Asegurate que el SKU sea único.');
        return res.json();
      })
      .then(() => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        fetchAllData();
      })
      .catch(err => alert(err.message));
  };

  const handleDeleteProduct = (id: string) => {
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo borrar el repuesto.');
        return res.json();
      })
      .then(() => {
        setProducts(prev => prev.filter(p => p.id !== id));
        fetchAllData();
      })
      .catch(err => alert(err.message));
  };

  const handleCreateTaxonomy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxonomyName.trim()) return;
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    const endpoint = taxonomyType === 'brand' 
      ? '/api/brands' 
      : taxonomyType === 'partBrand' 
      ? '/api/part-brands' 
      : taxonomyType === 'category'
      ? '/api/categories'
      : '/api/moto-models';
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: taxonomyName })
    })
      .then(res => res.json())
      .then(() => {
        setTaxonomyName('');
        fetchAllData();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteTaxonomy = (id: string, type: 'brand' | 'partBrand' | 'category' | 'motoModel') => {
    const token = localStorage.getItem('impormot_token');
    if (!token) return;

    const endpoint = type === 'brand' 
      ? `/api/brands/${id}` 
      : type === 'partBrand' 
      ? `/api/part-brands/${id}` 
      : type === 'category'
      ? `/api/categories/${id}`
      : `/api/moto-models/${id}`;
    fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchAllData())
      .catch(err => console.error(err));
  };

  const applyProductTemplate = (type: string) => {
    let templateData: any = {};
    if (type === 'transmision') {
      templateData = {
        name: 'Kit Transmisión Completa Yamasida Reforzada',
        sku: 'TRA-YAM-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands.find(b => b.name.toLowerCase().includes('yamas'))?.name || partBrands[0]?.name || 'Yamasida',
        category: categories.find(c => c.name.toLowerCase().includes('transm'))?.name || 'Transmisión',
        price: 45000,
        offerPrice: 39900,
        stock: 12,
        description: 'Kit de transmisión reforzado de alta durabilidad, fabricado con acero SAE 1045. Cadena reforzada para mayor vida útil y menor estiramiento.',
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop'],
        specs: {
          'Cadena': '520H x 114L Reforzada',
          'Corona': '45 Dientes Acero 1045',
          'Piñón': '14 Dientes Termotratado',
          'Origen': 'Japón'
        },
        tags: ['transmision', 'kit', 'reforzado'],
        compatibleMotos: ['Yamaha', 'Honda', 'Suzuki'],
        compatibleModels: ['Yamaha FZ FI', 'Honda CG 150 Titan', 'Yamaha YBR 125'],
        compatibleDisplacements: ['125cc', '150cc']
      };
    } else if (type === 'frenos') {
      templateData = {
        name: 'Pastillas de Freno Brembo Sinterizadas',
        sku: 'FRE-BRE-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands.find(b => b.name.toLowerCase().includes('brem'))?.name || partBrands[0]?.name || 'Brembo',
        category: categories.find(c => c.name.toLowerCase().includes('fren'))?.name || 'Frenos',
        price: 19500,
        offerPrice: 17900,
        stock: 20,
        description: 'Pastillas de freno sinterizadas de alta fricción. Ofrecen un frenado potente y estable en todas las condiciones climáticas con excelente tacto.',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'],
        specs: {
          'Compuesto': 'Sinterizado Metálico',
          'Posición': 'Delantera',
          'Uso': 'Urbano / Deportivo',
          'Origen': 'Italia'
        },
        tags: ['frenos', 'pastillas', 'sinterizadas', 'brembo'],
        compatibleMotos: ['Honda', 'Yamaha', 'KTM', 'Bajaj'],
        compatibleModels: ['Honda XR 150L', 'Yamaha FZ FI', 'Bajaj Rouser NS 200'],
        compatibleDisplacements: ['150cc', '200cc', '250cc']
      };
    } else if (type === 'lubricante') {
      templateData = {
        name: 'Aceite Motul 7100 4T 10W40 Sintético',
        sku: 'LUB-MOT-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands.find(b => b.name.toLowerCase().includes('motul'))?.name || partBrands[0]?.name || 'Motul',
        category: categories.find(c => c.name.toLowerCase().includes('lubri'))?.name || 'Lubricantes',
        price: 22000,
        offerPrice: undefined,
        stock: 50,
        description: 'Lubricante 100% sintético premium para motores de 4 tiempos. Tecnología de Éster para máxima protección y suavidad de embrague.',
        images: ['https://images.unsplash.com/photo-1635812920701-f2f2f7fc597b?q=80&w=600&auto=format&fit=crop'],
        specs: {
          'Tipo': '100% Sintético Éster',
          'Viscosidad': '10W40',
          'Norma': 'JASO MA2 - API SN',
          'Volumen': '1 Litro'
        },
        tags: ['lubricante', 'aceite', 'motul', 'sintetico'],
        compatibleMotos: ['Honda', 'Yamaha', 'Suzuki', 'KTM', 'Bajaj'],
        compatibleModels: ['Honda CG 150 Titan', 'Yamaha FZ FI', 'Bajaj Rouser NS 200', 'Honda Wave 110S'],
        compatibleDisplacements: ['110cc', '125cc', '150cc', '200cc', '250cc']
      };
    } else if (type === 'bujia') {
      templateData = {
        name: 'Bujía de Iridium NGK de Alta Performance',
        sku: 'ELE-NGK-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands.find(b => b.name.toLowerCase().includes('ngk'))?.name || partBrands[0]?.name || 'NGK',
        category: categories.find(c => c.name.toLowerCase().includes('electr'))?.name || 'Electricidad',
        price: 9800,
        offerPrice: 8500,
        stock: 35,
        description: 'Bujía de Iridium genuina NGK para una combustión óptima, mejor respuesta al acelerador y máxima durabilidad bajo condiciones severas.',
        images: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop'],
        specs: {
          'Material': 'Iridium',
          'Rango Térmico': 'Grado 7',
          'Duración': 'Hasta 50,000 km',
          'Rosca': '10mm x 19mm'
        },
        tags: ['bujia', 'ngk', 'iridium', 'electricidad', 'encendido'],
        compatibleMotos: ['Honda', 'Yamaha', 'Suzuki'],
        compatibleModels: ['Honda Wave 110S', 'Honda CG 150 Titan', 'Yamaha YBR 125'],
        compatibleDisplacements: ['110cc', '125cc', '150cc']
      };
    } else if (type === 'filtro') {
      templateData = {
        name: 'Filtro de Aire de Alto Rendimiento',
        sku: 'FIL-GEN-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands[0]?.name || 'Yamasida',
        category: categories.find(c => c.name.toLowerCase().includes('repuest'))?.name || 'Repuestos',
        price: 8500,
        offerPrice: undefined,
        stock: 25,
        description: 'Filtro de aire de celulosa de alta calidad. Mantiene el motor libre de impurezas asegurando la mezcla de aire/combustible perfecta.',
        images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop'],
        specs: {
          'Tipo': 'Papel Micrónico Filtrante',
          'Flujo': 'Optimizado estándar',
          'Origen': 'Argentina'
        },
        tags: ['filtro', 'aire', 'repuesto', 'admision'],
        compatibleMotos: ['Yamaha', 'Honda'],
        compatibleModels: ['Yamaha FZ FI', 'Honda CG 150 Titan'],
        compatibleDisplacements: ['150cc']
      };
    }
    setEditingProduct(prev => ({
      ...prev,
      ...templateData
    }));
  };

  const autoGenerateSku = () => {
    const cat = (editingProduct?.category || 'REP').substring(0, 3).toUpperCase();
    const brnd = (editingProduct?.brand || 'GEN').substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    const generatedSku = `${cat}-${brnd}-${rand}`;
    setEditingProduct(prev => prev ? { ...prev, sku: generatedSku } : null);
  };

  const applyStockImage = () => {
    if (!editingProduct) return;
    const cat = (editingProduct.category || '').toLowerCase();
    let imgUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop';
    if (cat.includes('freno')) {
      imgUrl = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop';
    } else if (cat.includes('lubri') || cat.includes('aceite')) {
      imgUrl = 'https://images.unsplash.com/photo-1635812920701-f2f2f7fc597b?q=80&w=600&auto=format&fit=crop';
    } else if (cat.includes('transmi') || cat.includes('cadena')) {
      imgUrl = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop';
    } else if (cat.includes('electr') || cat.includes('bujia')) {
      imgUrl = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop';
    } else if (cat.includes('accesorio') || cat.includes('casco')) {
      imgUrl = 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600&auto=format&fit=crop';
    }
    setEditingProduct(prev => prev ? { ...prev, images: [imgUrl] } : null);
  };

  const handleOpenProductModal = (prod: Product | null) => {
    if (prod) {
      setEditingProduct({ ...prod });
    } else {
      setEditingProduct({
        name: '',
        sku: 'TRA-' + Math.floor(100 + Math.random() * 900),
        brand: partBrands[0]?.name || 'Brembo',
        price: 15000,
        offerPrice: undefined,
        stock: 10,
        category: categories[0]?.name || 'Repuestos',
        description: '',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'],
        specs: {},
        tags: ['repuesto'],
        compatibleMotos: [],
        compatibleModels: [],
        compatibleDisplacements: []
      });
    }
    setIsProductModalOpen(true);
  };

  // Add Specification Key-Value helper
  const addSpecPair = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setEditingProduct(prev => {
      const copy = { ...prev };
      if (!copy.specs) copy.specs = {};
      copy.specs[specKey.trim()] = specVal.trim();
      return copy;
    });
    setSpecKey('');
    setSpecVal('');
  };

  const removeSpecKey = (keyToRemove: string) => {
    setEditingProduct(prev => {
      const copy = { ...prev };
      if (copy.specs) {
        delete copy.specs[keyToRemove];
      }
      return copy;
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'Confirmado': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'Preparando pedido': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'Enviado': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30';
      case 'Entregado': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Cancelado': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400';
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Title Header */}
      <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-slate-450">Consola de Control del Administrador</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Dashboard Administrativo <span className="text-[#F7E733]">IMPORMOT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Administrá el stock del depósito, gestioná pedidos pendientes, registrá categorías y actualizá compatibilidades en tiempo real.</p>
        </div>

        {/* Action button to create product */}
        <button
          onClick={() => handleOpenProductModal(null)}
          className="bg-[#F7E733] hover:bg-[#FFD500] text-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto hover:scale-103 active:scale-97 transition-all cursor-pointer"
        >
          <Plus size={15} className="stroke-[3]" /> Nuevo Repuesto
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1 bg-[#1a1a1a] p-1.2 rounded-xl mb-7 border border-[#222222] w-full max-w-2xl sm:w-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`p-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'stats' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <TrendingUp size={14} /> Vista General
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`p-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'products' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Package size={14} /> Depósito ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`p-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'orders' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingBag size={14} /> Ventas ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('taxonomies')}
          className={`p-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'taxonomies' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Layers size={14} /> Filtros y Marcas
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`p-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'users' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Users size={14} /> Clientes ({users.length})
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7E733] mx-auto mb-2"></div>
          <p className="text-xs text-gray-400">Recuperando registros administrativos de db.json...</p>
        </div>
      )}

      {/* 1. Vista General Statistics Tab */}
      {!loading && activeTab === 'stats' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">Facturación de Ventas</span>
              <p className="text-2xl font-black text-[#F7E733] mt-2">${metrics.totalSales?.toLocaleString('es-AR')}</p>
              <div className="flex items-center gap-1 text-[10px] text-green-400 mt-2">
                <ArrowUpRight size={12} />
                <span>+12.4% este mes</span>
              </div>
            </div>

            <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">Encargos Totales</span>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalOrdersCount} órdenes</p>
              <div className="flex items-center gap-1 text-[10px] text-sky-400 mt-2">
                <CheckCircle size={10} />
                <span>Sincronizado vía WhatsApp</span>
              </div>
            </div>

            <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">Total SKU Catálogo</span>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalProductsCount} artículos</p>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-2">
                <Package size={10} />
                <span>Compatibilidades activas</span>
              </div>
            </div>

            <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500 block">Registrados Activos</span>
              <p className="text-2xl font-black text-white mt-2">{metrics.totalUsersCount} usuarios</p>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-2">
                <Users size={10} />
                <span>Excluye cuentas admins</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trends Chart Representation (Pure custom styled HTML Grid) */}
            <div className="lg:col-span-2 bg-[#111111] p-5 rounded-2xl border border-[#222222]">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-1">
                <TrendingUp size={14} className="text-[#F7E733]" /> Historial de Facturación Reciente
              </h3>
              
              <div className="h-44 flex items-end justify-between gap-1 mt-6 px-4">
                {metrics.recentSalesTrends?.map((trend: any, idx: number) => {
                  // calculate normalized percentage
                  const maxVal = Math.max(...metrics.recentSalesTrends.map((t: any) => t.total)) || 1;
                  const pct = Math.round((trend.total / maxVal) * 80) + 10;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-[#222222] text-white p-1.5 px-2.5 rounded-lg text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-zinc-700 pointer-events-none">
                        {trend.id} : ${trend.total.toLocaleString('es-AR')}
                      </div>
                      
                      {/* Bar fill */}
                      <div 
                        className="w-11 bg-[#F7E733] hover:bg-[#FFD500] rounded-t-md transition-all duration-300 shadow-[0px_4px_12px_rgba(247,231,51,0.25)]" 
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[10px] font-mono text-gray-500 mt-1.5">{trend.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top high demand parts */}
            <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] flex flex-col">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles size={14} className="text-yellow-400" /> Repuestos Más Vendidos
              </h3>

              <div className="space-y-3.5 mt-2 flex-1 flex flex-col justify-center">
                {metrics.topSellingProducts?.length > 0 ? (
                  metrics.topSellingProducts.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#1a1a1a] p-2.5 rounded-xl border border-[#222222]">
                      <span className="text-xs font-black w-5 h-5 rounded-full bg-[#F7E733] text-black flex items-center justify-center font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate leading-tight">{p.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.quantity} unidades vendidas</p>
                      </div>
                      <span className="text-xs font-extrabold text-[#F7E733] shrink-0 font-mono">${p.revenue.toLocaleString('es-AR')}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-gray-550 text-gray-500 py-6">
                    No hay suficientes compras completadas para evaluar estadísticas de demanda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Depósito (Products List) CRUD Tab */}
      {!loading && activeTab === 'products' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#181818] border-b border-[#222222] flex flex-col md:flex-row justify-between items-center gap-3">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest font-mono">Control de Inventario</h3>
            
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Filtrá rápido por SKU, nombre, marca..."
                className="w-full bg-[#222222] text-xs text-white pl-8 pr-3 py-1.8 rounded-lg outline-none border border-transparent focus:border-[#F7E733] placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.2 text-gray-400" size={13} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#222222] text-white">
              <thead className="bg-[#141414] text-[10px] font-mono uppercase tracking-wider text-slate-450 text-slate-400">
                <tr>
                  <th className="p-4">SKU / ID</th>
                  <th className="p-4">Artículo</th>
                  <th className="p-4">Marca/Motos</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Precios (Normal / Oferta)</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-right">Controles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 font-mono select-all text-gray-300">
                      <p className="font-bold text-[#F7E733]">{p.sku}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{p.id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 object-contain p-0.5 rounded bg-zinc-900 border border-zinc-800"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p onClick={() => onNavigate('product-detail', { id: p.id })} className="font-extrabold cursor-pointer hover:text-[#F7E733] truncate">{p.name}</p>
                          <div className="flex gap-1 mt-1 truncate">
                            {p.compatibleModels?.slice(0, 3).map((m, i) => (
                              <span key={i} className="text-[8px] bg-zinc-900 px-1 py-0.2 rounded text-zinc-400 font-mono">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{p.brand}</td>
                    <td className="p-4 text-gray-300">{p.category}</td>
                    <td className="p-4 font-mono">
                      {p.offerPrice ? (
                        <>
                          <p className="text-[#F7E733] font-bold">${p.offerPrice.toLocaleString('es-AR')}</p>
                          <p className="text-[9px] line-through text-gray-500">${p.price.toLocaleString('es-AR')}</p>
                        </>
                      ) : (
                        <p className="font-bold">${p.price.toLocaleString('es-AR')}</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock <= 0 ? 'bg-red-950/40 text-red-400' : 'bg-green-950/40 text-green-400'}`}>
                        {p.stock} u.
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenProductModal(p)}
                        className="text-gray-400 hover:text-[#F7E733] p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors inline-block animate-none"
                        title="Editar"
                      >
                        <Edit size={13} />
                      </button>
                      {confirmDeleteProductId === p.id ? (
                        <div className="inline-flex items-center gap-1 bg-zinc-900 p-1 rounded border border-red-900/30">
                          <button
                            onClick={() => {
                              setConfirmDeleteProductId(null);
                              handleDeleteProduct(p.id);
                            }}
                            className="bg-red-650 hover:bg-red-750 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase cursor-pointer"
                          >
                            Sí, borrar
                          </button>
                          <button
                            onClick={() => setConfirmDeleteProductId(null)}
                            className="text-gray-400 hover:text-white text-[10px] px-1 font-bold cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteProductId(p.id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors inline-block cursor-pointer"
                          title="Borrar"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Ventas (Orders Dispatcher) Tab */}
      {!loading && activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
            <div className="p-4 bg-[#181818] border-b border-[#222222]">
              <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest font-mono">Despacho de Pedidos</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-[#222222] text-white">
                <thead className="bg-[#141414] text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-4">ID Orden</th>
                    <th className="p-4">Cliente / Contacto</th>
                    <th className="p-4">Dirección Despacho</th>
                    <th className="p-4">Items / Unidades</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Estado Logístico</th>
                    <th className="p-4 text-right">Modificar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#F7E733] select-all">{o.id}</td>
                      <td className="p-4">
                        <p className="font-bold leading-none">{o.customerName} {o.customerLastName}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">{o.customerPhone}</p>
                        {o.customerEmail && <p className="text-[9px] text-[#F7E733] font-mono mt-0.5">{o.customerEmail}</p>}
                      </td>
                      <td className="p-4 text-gray-300">
                        <p className="leading-tight">{o.address}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{o.city}, {o.state}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {o.items.map((it, idx) => (
                            <p key={idx} className="text-[10px] text-zinc-300 leading-snug truncate max-w-xs font-medium">
                              • {it.name} <strong className="text-gray-500">(x{it.quantity})</strong>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#F7E733]">${o.total.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.8 rounded text-[9px] uppercase tracking-wide font-black border ${getStatusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          className="bg-[#222222] text-xs text-white p-1 px-2 rounded outline-none border border-gray-800 focus:border-[#F7E733]"
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="Preparando pedido">Preparando pedido</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Filtros y Marcas Management Tab */}
      {!loading && activeTab === 'taxonomies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          
          {/* Create form */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] h-fit">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-5">Agregar Filtro Taxonómico</h3>
            
            <form onSubmit={handleCreateTaxonomy} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Tipo de Filtro</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#1c1c1c] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTaxonomyType('brand')}
                    className={`p-1 text-[10px] font-bold rounded ${taxonomyType === 'brand' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Marca Moto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxonomyType('partBrand')}
                    className={`p-1 text-[10px] font-bold rounded ${taxonomyType === 'partBrand' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Marca Repuesto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxonomyType('category')}
                    className={`p-1 text-[10px] font-bold rounded ${taxonomyType === 'category' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Categoría
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxonomyType('motoModel')}
                    className={`p-1 text-[10px] font-bold rounded ${taxonomyType === 'motoModel' ? 'bg-[#F7E733] text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Modelo Moto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder={taxonomyType === 'brand' ? 'Ej: Honda, KTM, Bajaj...' : taxonomyType === 'partBrand' ? 'Ej: Brembo, Motul, NGK...' : taxonomyType === 'category' ? 'Ej: Frenos, Transmisión...' : 'Ej: Wave 110, XR 150...'}
                  className="w-full bg-[#1c1c1c] border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#F7E733]"
                  value={taxonomyName}
                  onChange={(e) => setTaxonomyName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F7E733] text-black hover:bg-[#FFD500] font-extrabold text-xs uppercase py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus size={13} className="stroke-[3]" /> Crear Registro
              </button>
            </form>
          </div>

          {/* Brands list */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest mb-4 flex items-center gap-1.5">
              <Building size={14} /> Marcas de Moto ({brands.length})
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-[#222222] pr-1.5">
              {brands.map(b => (
                <div key={b.id} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{b.name}</span>
                  {confirmDeleteTaxonomyId === b.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setConfirmDeleteTaxonomyId(null);
                          handleDeleteTaxonomy(b.id, 'brand');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTaxonomyId(null)}
                        className="text-gray-400 hover:text-white text-[9px] font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteTaxonomyId(b.id)}
                      className="text-gray-500 hover:text-red-400 p-1 hover:bg-zinc-900 rounded cursor-pointer"
                      title="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Part Brands list */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest mb-4 flex items-center gap-1.5">
              <Wrench size={14} /> Marcas de Repuesto ({partBrands.length})
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-[#222222] pr-1.5">
              {partBrands.map(pb => (
                <div key={pb.id} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{pb.name}</span>
                  {confirmDeleteTaxonomyId === pb.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setConfirmDeleteTaxonomyId(null);
                          handleDeleteTaxonomy(pb.id, 'partBrand');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTaxonomyId(null)}
                        className="text-gray-400 hover:text-white text-[9px] font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteTaxonomyId(pb.id)}
                      className="text-gray-500 hover:text-red-400 p-1 hover:bg-zinc-900 rounded cursor-pointer"
                      title="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Categories list */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest mb-4 flex items-center gap-1.5">
              <Layers size={14} /> Categorías de Catálogo ({categories.length})
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-[#222222] pr-1.5">
              {categories.map(c => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{c.name}</span>
                  {confirmDeleteTaxonomyId === c.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setConfirmDeleteTaxonomyId(null);
                          handleDeleteTaxonomy(c.id, 'category');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTaxonomyId(null)}
                        className="text-gray-400 hover:text-white text-[9px] font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteTaxonomyId(c.id)}
                      className="text-gray-500 hover:text-red-400 p-1 hover:bg-zinc-900 rounded cursor-pointer"
                      title="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Motorcycle Models list */}
          <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222]">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles size={14} /> Modelos de Moto ({motoModels.length})
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-[#222222] pr-1.5">
              {motoModels.map(mm => (
                <div key={mm.id} className="py-2.5 flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{mm.name}</span>
                  {confirmDeleteTaxonomyId === mm.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          setConfirmDeleteTaxonomyId(null);
                          handleDeleteTaxonomy(mm.id, 'motoModel');
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteTaxonomyId(null)}
                        className="text-gray-400 hover:text-white text-[9px] font-bold cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteTaxonomyId(mm.id)}
                      className="text-gray-500 hover:text-red-400 p-1 hover:bg-zinc-900 rounded cursor-pointer"
                      title="Borrar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Clientes Directory Tab */}
      {!loading && activeTab === 'users' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#181818] border-b border-[#222222]">
            <h3 className="text-xs uppercase font-bold text-[#F7E733] tracking-widest font-mono">Directorio de Clientes</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-[#222222] text-white">
              <thead className="bg-[#141414] text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">ID Cliente</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Localidad / Código Postal</th>
                  <th className="p-4">Calle y Número</th>
                  <th className="p-4">Historial de Órdenes</th>
                  <th className="p-4 font-mono">Rol / Nivel</th>
                  <th className="p-4 text-gray-400">Fecha de Registro</th>
                  <th className="p-4 text-right">Asignar Rol</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {users.map(u => {
                  const clientOrdersCount = orders.filter(o => o.customerEmail === u.email || o.customerPhone === u.phone).length;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 font-mono font-semibold text-gray-400">{u.id}</td>
                      <td className="p-4">
                        <p className="font-bold">{u.name} {u.lastName}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.email}</p>
                        <p className="text-[10px] text-[#F7E733] font-mono mt-0.5">{u.phone}</p>
                      </td>
                      <td className="p-4">
                        <p>{u.city}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.state} (CP {u.zipCode})</p>
                      </td>
                      <td className="p-4 text-gray-300">{u.address}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-extrabold ${clientOrdersCount > 0 ? 'bg-green-950 text-green-400' : 'bg-zinc-900 text-zinc-500'}`}>
                          {clientOrdersCount} pedidos
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-black tracking-wide border ${u.role === 'admin' ? 'text-[#F7E733] bg-[#F7E733]/10 border-[#F7E733]/30' : 'text-slate-350 bg-zinc-900/40 border-zinc-805'}`}>
                          {u.role === 'admin' ? '🔑 ADMINISTRADOR' : '👤 CLIENTE'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 font-mono">
                        {new Date(u.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <select
                            className="bg-[#222222] text-xs text-white p-1.5 px-2 rounded-lg outline-none border border-gray-800 focus:border-[#F7E733]"
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as 'admin' | 'user')}
                            disabled={userRoleStatus[u.id] === 'saving'}
                          >
                            <option value="user">Cliente estándar</option>
                            <option value="admin">Administrador 🔑</option>
                          </select>
                          
                          {userRoleStatus[u.id] === 'saving' && (
                            <span className="text-[10px] text-[#F7E733] font-bold animate-pulse">
                              Guardando cambio...
                            </span>
                          )}
                          {userRoleStatus[u.id] === 'success' && (
                            <span className="text-[10px] text-green-400 font-bold bg-green-950/40 px-1.5 py-0.5 rounded border border-green-900/40">
                              ✓ Cambiado con éxito
                            </span>
                          )}
                          {userRoleStatus[u.id] === 'error' && (
                            <span className="text-[10px] text-red-400 font-bold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                              ✗ Error al guardar
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {confirmDeleteUserId === u.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setConfirmDeleteUserId(null);
                                  handleDeleteUser(u.id);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase px-2 py-1 rounded transition-all cursor-pointer shadow-sm"
                                title="Confirmar eliminación"
                              >
                                Eliminar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteUserId(null)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold text-[10px] px-1.5 py-1 rounded transition-colors cursor-pointer"
                                title="Cancelar"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-delete-user-${u.id}`}
                              onClick={() => setConfirmDeleteUserId(u.id)}
                              className="text-gray-500 hover:text-red-400 p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors inline-flex items-center cursor-pointer"
                              title="Eliminar Cliente permanentemente"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          {userDeleteError[u.id] && (
                            <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40 max-w-[120px] text-center leading-tight mt-1">
                              {userDeleteError[u.id]}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Products Editor Modal Overlay */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
            <div className="sticky top-0 bg-[#111111] p-4 border-b border-[#222222] flex justify-between items-center z-10">
              <h3 className="text-sm uppercase font-black text-white flex items-center gap-1.5">
                <Settings size={16} className="text-[#F7E733]" />
                {editingProduct.id ? 'Editar Repuesto del Depósito' : 'Agregar Repuesto Nuevo'}
              </h3>
              <button 
                onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                className="text-gray-450 text-gray-400 hover:text-white shrink-0 hover:bg-zinc-900 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 text-xs text-white">
              
              {/* Quick Template Selector - only for new products to make it extremely fast & easy */}
              {!editingProduct.id && (
                <div className="bg-[#181818] p-3.5 rounded-xl border border-dashed border-zinc-800 space-y-2">
                  <p className="text-[10px] font-mono text-[#F7E733] uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Sparkles size={12} /> ¿Querés agilizar? Cargá una plantilla pre-diseñada:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyProductTemplate('transmision')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      ⚙️ Kit de Transmisión
                    </button>
                    <button
                      type="button"
                      onClick={() => applyProductTemplate('frenos')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      🛑 Pastillas de Freno
                    </button>
                    <button
                      type="button"
                      onClick={() => applyProductTemplate('lubricante')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      🧴 Aceite Lubricante
                    </button>
                    <button
                      type="button"
                      onClick={() => applyProductTemplate('bujia')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      ⚡ Bujía de Encendido
                    </button>
                    <button
                      type="button"
                      onClick={() => applyProductTemplate('filtro')}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      💨 Filtro de Aire
                    </button>
                  </div>
                </div>
              )}

              {/* Row 1: Name and SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Nombre Comercial del Repuesto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Kit de Embrague Completo Yamaha FZ16"
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#F7E733]"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide">SKU Código</label>
                    <button
                      type="button"
                      onClick={autoGenerateSku}
                      className="text-[9px] font-bold text-[#F7E733] hover:underline flex items-center gap-0.5"
                      title="Generar SKU automático según categoría y marca"
                    >
                      ⚡ Generar
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: EMB-FZ16"
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs uppercase font-mono text-[#F7E733] focus:outline-none focus:border-[#F7E733]"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              {/* Row 2: Brand, Category, Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Marca Repuesto</label>
                  <select
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, brand: e.target.value }))}
                  >
                    {partBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    {!partBrands.some(b => b.name === editingProduct.brand) && (
                      <option value={editingProduct.brand}>{editingProduct.brand}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Categoría</label>
                  <select
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {!categories.some(c => c.name === editingProduct.category) && (
                      <option value={editingProduct.category}>{editingProduct.category}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Precio Normal ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-[#F7E733] focus:outline-none"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Precio Promocional ($)</label>
                  <input
                    type="number"
                    placeholder="Opcional"
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-green-400 focus:outline-none"
                    value={editingProduct.offerPrice || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, offerPrice: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>

              {/* Row 3: Stock + Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Cantidad Depósito</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs focus:outline-none"
                    value={editingProduct.stock === undefined ? 0 : editingProduct.stock}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide">URL de Imagen Principal</label>
                    <button
                      type="button"
                      onClick={applyStockImage}
                      className="text-[9px] font-bold text-[#F7E733] hover:underline flex items-center gap-0.5"
                      title="Sugerir una imagen de stock adecuada según la categoría seleccionada"
                    >
                      🖼️ Rellenar con Foto de Stock
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs focus:outline-none font-mono text-zinc-300"
                    value={editingProduct.images?.[0] || ''}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, images: [e.target.value] }))}
                  />
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wide mb-1">Descripción del repuesto</label>
                <textarea
                  placeholder="Detallá las propiedades de este repuesto..."
                  className="w-full bg-[#1c1c1c] border border-zinc-805 rounded-lg p-2.5 text-xs text-white h-24 focus:outline-none"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Row 5: Moto Compatible, Cilindrada, Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-900">
                <div>
                  <label className="block text-[10px] font-mono text-[#F7E733] uppercase tracking-wide mb-1">Marcas Compatibles (Comas)</label>
                  <input
                    type="text"
                    placeholder="Honda, Yamaha, KTM"
                    className="w-full bg-[#111111] border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none text-zinc-300 mb-1.5"
                    value={editingProduct.compatibleMotos?.join(', ') || ''}
                    onChange={(e) => setEditingProduct(prev => ({ 
                      ...prev, 
                      compatibleMotos: e.target.value.split(',').map(m => m.trim()).filter(Boolean) 
                    }))}
                  />
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-[#0c0c0c] rounded border border-zinc-900">
                    {brands.map(b => {
                      const isSelected = editingProduct.compatibleMotos?.some(x => x.toLowerCase() === b.name.toLowerCase());
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            const current = editingProduct.compatibleMotos || [];
                            const alreadyInList = current.some(x => x.toLowerCase() === b.name.toLowerCase());
                            const updated = alreadyInList 
                              ? current.filter(x => x.toLowerCase() !== b.name.toLowerCase())
                              : [...current, b.name];
                            setEditingProduct(prev => ({ ...prev, compatibleMotos: updated }));
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#F7E733] text-black border border-[#F7E733]' 
                              : 'bg-[#1c1c1c] text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{b.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#F7E733] uppercase tracking-wide mb-1">Modelos Compatibles</label>
                  <input
                    type="text"
                    placeholder="Honda Wave 110, CG Titan"
                    className="w-full bg-[#111111] border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none text-zinc-300 mb-1.5"
                    value={editingProduct.compatibleModels?.join(', ') || ''}
                    onChange={(e) => setEditingProduct(prev => ({ 
                      ...prev, 
                      compatibleModels: e.target.value.split(',').map(m => m.trim()).filter(Boolean) 
                    }))}
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#0c0c0c] rounded border border-zinc-900">
                    {motoModels.map(mm => {
                      const isSelected = editingProduct.compatibleModels?.some(x => x.toLowerCase() === mm.name.toLowerCase());
                      return (
                        <button
                          key={mm.id}
                          type="button"
                          onClick={() => {
                            const current = editingProduct.compatibleModels || [];
                            const alreadyInList = current.some(x => x.toLowerCase() === mm.name.toLowerCase());
                            const updated = alreadyInList 
                              ? current.filter(x => x.toLowerCase() !== mm.name.toLowerCase())
                              : [...current, mm.name];
                            setEditingProduct(prev => ({ ...prev, compatibleModels: updated }));
                          }}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#F7E733] text-black border border-[#F7E733]' 
                              : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{mm.name}
                        </button>
                      );
                    })}
                    {motoModels.length === 0 && (
                      <span className="text-[9px] text-zinc-500 italic">No hay modelos de moto guardados. Creá uno en la pestaña de Filtros.</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#F7E733] uppercase tracking-wide mb-1">Cilindradas (Comas)</label>
                  <input
                    type="text"
                    placeholder="110cc, 125cc, 150cc"
                    className="w-full bg-[#111111] border border-zinc-850 rounded-lg p-2.5 text-xs focus:outline-none text-zinc-300 mb-1.5"
                    value={editingProduct.compatibleDisplacements?.join(', ') || ''}
                    onChange={(e) => setEditingProduct(prev => ({ 
                      ...prev, 
                      compatibleDisplacements: e.target.value.split(',').map(m => m.trim()).filter(Boolean) 
                    }))}
                  />
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-[#0c0c0c] rounded border border-zinc-900">
                    {['110cc', '125cc', '150cc', '200cc', '250cc', '300cc', '400cc', '600cc'].map(cc => {
                      const isSelected = editingProduct.compatibleDisplacements?.some(x => x.toLowerCase() === cc.toLowerCase());
                      return (
                        <button
                          key={cc}
                          type="button"
                          onClick={() => {
                            const current = editingProduct.compatibleDisplacements || [];
                            const alreadyInList = current.some(x => x.toLowerCase() === cc.toLowerCase());
                            const updated = alreadyInList 
                              ? current.filter(x => x.toLowerCase() !== cc.toLowerCase())
                              : [...current, cc];
                            setEditingProduct(prev => ({ ...prev, compatibleDisplacements: updated }));
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#F7E733] text-black border border-[#F7E733]' 
                              : 'bg-[#1c1c1c] text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{cc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Specifications Editor (Pair list builder) */}
              <div className="p-4 bg-zinc-900 rounded-xl space-y-3">
                <p className="block text-[10px] font-mono text-gray-300 uppercase tracking-wide border-b border-zinc-800 pb-1.5 font-bold">Ficha Técnica e Informaciones de Fábrica</p>
                
                {/* Specs values list */}
                {editingProduct.specs && Object.keys(editingProduct.specs).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
                    {Object.entries(editingProduct.specs).map(([key, val]) => (
                      <div key={key} className="p-2 bg-black border border-zinc-800 rounded-lg flex justify-between items-center text-[11px] font-mono">
                        <span className="text-gray-400 font-semibold">{key}: <span className="text-white font-normal">{val}</span></span>
                        <button
                          type="button"
                          onClick={() => removeSpecKey(key)}
                          className="text-red-400 hover:text-red-300 font-bold px-1"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form to insert extra spec pair */}
                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    placeholder="Especificación (Ej: Origen)"
                    className="bg-black border border-zinc-800 rounded p-2 text-xs text-white w-full sm:w-1/3"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Propiedad (Ej: Japón)"
                    className="bg-black border border-zinc-800 rounded p-2 text-xs text-white w-full sm:w-1/2"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addSpecPair}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2 px-3 text-xs uppercase shrink-0 rounded"
                  >
                    Añadir Especificación
                  </button>
                </div>
              </div>

              {/* Action save trigger */}
              <div className="pt-4 border-t border-[#1c1c1c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs uppercase font-bold py-2.5 px-4 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#F7E733] hover:bg-[#FFD500] text-black text-xs uppercase font-black py-2.5 px-6 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Guardar Producto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
