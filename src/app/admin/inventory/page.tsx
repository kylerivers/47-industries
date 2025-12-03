'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku: string | null
  stock: number
  price: number
  category: { name: string } | null
  active: boolean
  images: string[]
}

interface StockMovement {
  id: string
  productId: string
  product: { name: string }
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string | null
  createdAt: string
}

interface InventoryAlert {
  id: string
  productId: string
  product: { name: string; stock: number }
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK'
  threshold: number
  isResolved: boolean
  createdAt: string
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'alerts'>('overview')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all')
  const [showAdjustModal, setShowAdjustModal] = useState<Product | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const [productsRes, movementsRes, alertsRes] = await Promise.all([
        fetch('/api/admin/inventory'),
        fetch('/api/admin/inventory/movements'),
        fetch('/api/admin/inventory/alerts'),
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
      }
      if (movementsRes.ok) {
        const data = await movementsRes.json()
        setMovements(data.movements || [])
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    }
    setLoading(false)
  }

  const LOW_STOCK_THRESHOLD = 10

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(search.toLowerCase()))

    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
    } else if (stockFilter === 'out') {
      matchesStock = product.stock === 0
    } else if (stockFilter === 'healthy') {
      matchesStock = product.stock > LOW_STOCK_THRESHOLD
    }

    return matchesSearch && matchesStock
  })

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    activeAlerts: alerts.filter(a => !a.isResolved).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-text-secondary mt-1">
            Track stock levels and manage inventory
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/api/admin/inventory/export?format=csv'}
            className="px-4 py-2 bg-surface border border-border text-white rounded-xl hover:bg-surface-elevated transition-colors font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total Products</p>
          <p className="text-2xl font-bold mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.lowStock}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Out of Stock</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{stats.outOfStock}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Inventory Value</p>
          <p className="text-2xl font-bold mt-1 text-green-400">
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Active Alerts</p>
          <p className="text-2xl font-bold mt-1 text-orange-400">{stats.activeAlerts}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Stock Overview' },
            { id: 'movements', label: 'Stock Movements' },
            { id: 'alerts', label: `Alerts (${stats.activeAlerts})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <StockOverview
              products={filteredProducts}
              search={search}
              setSearch={setSearch}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              onAdjust={setShowAdjustModal}
            />
          )}
          {activeTab === 'movements' && (
            <StockMovements movements={movements} />
          )}
          {activeTab === 'alerts' && (
            <InventoryAlerts alerts={alerts} onRefresh={fetchInventory} />
          )}
        </>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <AdjustStockModal
          product={showAdjustModal}
          onClose={() => setShowAdjustModal(null)}
          onSaved={() => {
            setShowAdjustModal(null)
            fetchInventory()
          }}
        />
      )}
    </div>
  )
}

function StockOverview({
  products,
  search,
  setSearch,
  stockFilter,
  setStockFilter,
  onAdjust,
}: {
  products: Product[]
  search: string
  setSearch: (s: string) => void
  stockFilter: 'all' | 'low' | 'out' | 'healthy'
  setStockFilter: (f: 'all' | 'low' | 'out' | 'healthy') => void
  onAdjust: (p: Product) => void
}) {
  const LOW_STOCK_THRESHOLD = 10

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out of Stock' },
            { value: 'healthy', label: 'Healthy' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStockFilter(filter.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                stockFilter === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-text-secondary">
            {search ? 'Try a different search term' : 'Add products to start tracking inventory'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Value</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const status = product.stock === 0 ? 'out' : product.stock <= LOW_STOCK_THRESHOLD ? 'low' : 'healthy'
                return (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-text-secondary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-mono text-sm">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {product.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${
                        status === 'out' ? 'text-red-400' :
                        status === 'low' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${(product.price * product.stock).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'out' ? 'bg-red-500/20 text-red-400' :
                        status === 'low' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onAdjust(product)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                        >
                          Adjust
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="px-3 py-1.5 bg-surface-elevated border border-border rounded-lg text-sm hover:border-blue-500/50 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StockMovements({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="space-y-4">
      {movements.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No stock movements yet</h3>
          <p className="text-text-secondary">
            Stock adjustments and order-related changes will appear here
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(movement => (
                <tr key={movement.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(movement.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">{movement.product?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      movement.type === 'IN' ? 'bg-green-500/20 text-green-400' :
                      movement.type === 'OUT' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={movement.quantity >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {movement.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function InventoryAlerts({ alerts, onRefresh }: { alerts: InventoryAlert[]; onRefresh: () => void }) {
  const activeAlerts = alerts.filter(a => !a.isResolved)
  const resolvedAlerts = alerts.filter(a => a.isResolved)

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/inventory/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true }),
      })
      onRefresh()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Alerts ({activeAlerts.length})</h3>
        {activeAlerts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <svg className="w-10 h-10 mx-auto mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary">No active alerts - all inventory levels are healthy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-surface border rounded-xl p-4 flex items-center justify-between ${
                  alert.type === 'OUT_OF_STOCK' ? 'border-red-500/50' :
                  alert.type === 'LOW_STOCK' ? 'border-yellow-500/50' :
                  'border-orange-500/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'OUT_OF_STOCK' ? 'bg-red-500/20' :
                    alert.type === 'LOW_STOCK' ? 'bg-yellow-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {alert.type === 'OUT_OF_STOCK' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      ) : alert.type === 'LOW_STOCK' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      )}
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{alert.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-text-secondary">
                      {alert.type === 'OUT_OF_STOCK' && 'Product is out of stock'}
                      {alert.type === 'LOW_STOCK' && `Stock level (${alert.product?.stock}) below threshold (${alert.threshold})`}
                      {alert.type === 'OVERSTOCK' && `Stock level exceeds recommended maximum`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-text-secondary">Resolved Alerts ({resolvedAlerts.length})</h3>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{alert.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-text-secondary">{alert.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className="text-sm text-text-secondary">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdjustStockModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product
  onClose: () => void
  onSaved: () => void
}) {
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('add')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/inventory/${product.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: adjustmentType,
          quantity: parseInt(quantity),
          reason,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to adjust stock')
      }

      onSaved()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const newStock =
    adjustmentType === 'set' ? parseInt(quantity) || 0 :
    adjustmentType === 'add' ? product.stock + (parseInt(quantity) || 0) :
    product.stock - (parseInt(quantity) || 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>

        <div className="bg-surface-elevated rounded-lg p-4 mb-4">
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-text-secondary">Current stock: {product.stock}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Adjustment Type</label>
            <div className="flex gap-2">
              {[
                { value: 'add', label: 'Add Stock' },
                { value: 'subtract', label: 'Remove Stock' },
                { value: 'set', label: 'Set Stock' },
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAdjustmentType(type.value as any)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    adjustmentType === type.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-surface-elevated border border-border hover:border-blue-500/50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              required
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received shipment, Damaged goods"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {quantity && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
              <p className="text-sm">
                New stock level: <span className="font-bold text-blue-400">{Math.max(0, newStock)}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !quantity}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Adjustment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-surface-elevated border border-border rounded-lg font-medium hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
