'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ============ TYPES ============
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  category: { id: string; name: string } | null
  author: { name: string | null; email: string } | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  _count?: { views: number }
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  _count: { posts: number }
}

interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  recipientType: 'all' | 'segment' | 'manual'
  segmentId: string | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent'
  scheduledAt: string | null
  sentAt: string | null
  totalRecipients: number
  sentCount: number
  openCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

interface CustomerSegment {
  id: string
  name: string
  color: string
  memberCount: number
}

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  PUBLISHED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  ARCHIVED: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
}

const campaignStatusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  sending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  sent: { bg: 'bg-green-500/20', text: 'text-green-400' },
}

// ============ POSTS TAB ============
function PostsTab({
  posts,
  categories,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onDelete,
}: {
  posts: BlogPost[]
  categories: BlogCategory[]
  statusFilter: string
  setStatusFilter: (s: string) => void
  categoryFilter: string
  setCategoryFilter: (s: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
          <p className="text-text-secondary">
            Create your first blog post to share news and updates
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-surface border border-border rounded-xl p-6 flex gap-6"
            >
              {/* Cover Image */}
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-32 h-24 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-24 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                      {post.excerpt || 'No excerpt'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    statusColors[post.status]?.bg || 'bg-gray-500/20'
                  } ${statusColors[post.status]?.text || 'text-gray-400'}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-text-secondary">
                  {post.category && (
                    <span className="bg-surface-elevated px-2 py-1 rounded">
                      {post.category.name}
                    </span>
                  )}
                  <span>By {post.author?.name || 'Unknown'}</span>
                  <span>
                    {post.publishedAt
                      ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                      : `Created ${new Date(post.createdAt).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors text-center"
                >
                  Edit
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm hover:border-blue-500/50 transition-colors text-center"
                >
                  View
                </Link>
                <button
                  onClick={() => onDelete(post.id)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ CATEGORIES TAB ============
function CategoriesTab({
  categories,
  onRefresh,
}: {
  categories: BlogCategory[]
  onRefresh: () => void
}) {
  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure? All posts in this category will be uncategorized.')) return

    try {
      const res = await fetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE' })
      if (res.ok) onRefresh()
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
          <p className="text-text-secondary">
            Create categories to organize your blog posts
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Posts</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-sm">{category.slug}</td>
                  <td className="px-6 py-4">{category._count?.posts || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
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

// ============ CAMPAIGNS TAB ============
function CampaignsTab({
  campaigns,
  segments,
  onRefresh,
}: {
  campaigns: EmailCampaign[]
  segments: CustomerSegment[]
  onRefresh: () => void
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)

  const filteredCampaigns = statusFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === statusFilter)

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${id}`, { method: 'DELETE' })
      if (res.ok) onRefresh()
    } catch (error) {
      console.error('Failed to delete campaign:', error)
    }
  }

  const stats = {
    totalCampaigns: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    drafts: campaigns.filter(c => c.status === 'draft').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
    totalOpens: campaigns.reduce((sum, c) => sum + c.openCount, 0),
  }

  const avgOpenRate = stats.totalSent > 0 ? ((stats.totalOpens / stats.totalSent) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.totalCampaigns}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Sent</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{stats.sent}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Scheduled</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">{stats.scheduled}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Drafts</p>
          <p className="text-2xl font-bold mt-1 text-gray-400">{stats.drafts}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Emails Sent</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">{stats.totalSent}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Open Rate</p>
          <p className="text-2xl font-bold mt-1 text-yellow-400">{avgOpenRate}%</p>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Campaigns' },
            { value: 'draft', label: 'Drafts' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'sent', label: 'Sent' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewCampaignModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
        >
          + New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-text-secondary mb-4">
            Create your first email campaign to engage with customers
          </p>
          <button
            onClick={() => setShowNewCampaignModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => (
            <div
              key={campaign.id}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaignStatusColors[campaign.status]?.bg || 'bg-gray-500/20'
                    } ${campaignStatusColors[campaign.status]?.text || 'text-gray-400'}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm mb-3">
                    Subject: {campaign.subject}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                    <span>
                      Recipients: {campaign.recipientType === 'all' ? 'All Customers' :
                        campaign.recipientType === 'segment' ? `Segment` : 'Manual Selection'}
                    </span>
                    {campaign.status === 'sent' && (
                      <>
                        <span className="text-green-400">
                          {campaign.sentCount} sent
                        </span>
                        <span className="text-blue-400">
                          {campaign.openCount} opens ({campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0}%)
                        </span>
                        <span className="text-purple-400">
                          {campaign.clickCount} clicks
                        </span>
                      </>
                    )}
                    {campaign.scheduledAt && campaign.status === 'scheduled' && (
                      <span className="text-blue-400">
                        Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}
                      </span>
                    )}
                    {campaign.sentAt && (
                      <span>
                        Sent: {new Date(campaign.sentAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <>
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {campaign.status === 'sent' && (
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="px-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm hover:border-blue-500/50 transition-colors"
                    >
                      View Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaignModal && (
        <CampaignModal
          segments={segments}
          onClose={() => setShowNewCampaignModal(false)}
          onSaved={() => {
            setShowNewCampaignModal(false)
            onRefresh()
          }}
        />
      )}

      {/* Edit/View Campaign Modal */}
      {selectedCampaign && (
        <CampaignModal
          campaign={selectedCampaign}
          segments={segments}
          onClose={() => setSelectedCampaign(null)}
          onSaved={() => {
            setSelectedCampaign(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}

// ============ MODALS ============
function NewPostModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: BlogCategory[]
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [coverImage, setCoverImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }, [title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          categoryId: categoryId || null,
          status,
          coverImage: coverImage || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create post')
      }

      onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-2xl w-full my-8">
        <h2 className="text-xl font-bold mb-4">New Blog Post</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description for previews"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write your blog post content here... (Markdown supported)"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Publish Now</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
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

function NewCategoryModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }, [name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create category')
      }

      onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">New Category</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="category-slug"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Category'}
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

function CampaignModal({
  campaign,
  segments,
  onClose,
  onSaved,
}: {
  campaign?: EmailCampaign
  segments: CustomerSegment[]
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(campaign?.name || '')
  const [subject, setSubject] = useState(campaign?.subject || '')
  const [content, setContent] = useState(campaign?.content || '')
  const [recipientType, setRecipientType] = useState<'all' | 'segment'>(
    campaign?.recipientType === 'segment' ? 'segment' : 'all'
  )
  const [segmentId, setSegmentId] = useState(campaign?.segmentId || '')
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isViewOnly = campaign?.status === 'sent'

  const handleSubmit = async (action: 'save' | 'schedule' | 'send') => {
    setLoading(true)
    setError('')

    try {
      const method = campaign ? 'PATCH' : 'POST'
      const url = campaign
        ? `/api/admin/marketing/campaigns/${campaign.id}`
        : '/api/admin/marketing/campaigns'

      const body: any = {
        name,
        subject,
        content,
        recipientType,
        segmentId: recipientType === 'segment' ? segmentId : null,
      }

      if (action === 'schedule' && scheduledAt) {
        body.status = 'scheduled'
        body.scheduledAt = new Date(scheduledAt).toISOString()
      } else if (action === 'send') {
        body.status = 'sending'
      } else {
        body.status = 'draft'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save campaign')
      }

      onSaved()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-3xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {isViewOnly ? 'Campaign Report' : campaign ? 'Edit Campaign' : 'New Campaign'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Stats for sent campaigns */}
        {isViewOnly && campaign && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-surface-elevated rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{campaign.sentCount}</p>
              <p className="text-sm text-text-secondary">Sent</p>
            </div>
            <div className="bg-surface-elevated rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{campaign.openCount}</p>
              <p className="text-sm text-text-secondary">Opens</p>
            </div>
            <div className="bg-surface-elevated rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{campaign.clickCount}</p>
              <p className="text-sm text-text-secondary">Clicks</p>
            </div>
            <div className="bg-surface-elevated rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-text-secondary">Open Rate</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name *</label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Holiday Sale Announcement"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Subject *</label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Don't miss our biggest sale of the year!"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipients</label>
              <select
                disabled={isViewOnly}
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value as any)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60"
              >
                <option value="all">All Customers</option>
                <option value="segment">Customer Segment</option>
              </select>
            </div>

            {recipientType === 'segment' && (
              <div>
                <label className="block text-sm font-medium mb-2">Select Segment</label>
                <select
                  disabled={isViewOnly}
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-60"
                >
                  <option value="">Choose a segment...</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Content *</label>
            <textarea
              required
              disabled={isViewOnly}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your email content here... (HTML supported)"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 resize-none font-mono text-sm disabled:opacity-60"
            />
          </div>

          {!isViewOnly && (
            <div>
              <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {!isViewOnly && (
          <div className="flex gap-3 pt-6">
            <button
              onClick={() => handleSubmit('save')}
              disabled={loading || !name || !subject || !content}
              className="flex-1 px-4 py-3 bg-surface-elevated border border-border rounded-lg font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            {scheduledAt && (
              <button
                onClick={() => handleSubmit('schedule')}
                disabled={loading || !name || !subject || !content}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule'}
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to send this campaign immediately?')) {
                  handleSubmit('send')
                }
              }}
              disabled={loading || !name || !subject || !content}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        )}

        {isViewOnly && (
          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-surface-elevated border border-border rounded-lg font-medium hover:bg-surface transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ MAIN PAGE ============
export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'campaigns'>('posts')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [statusFilter, categoryFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)

      const [postsRes, categoriesRes, campaignsRes, segmentsRes] = await Promise.all([
        fetch(`/api/admin/blog/posts?${params}`),
        fetch('/api/admin/blog/categories'),
        fetch('/api/admin/marketing/campaigns'),
        fetch('/api/admin/customers/segments'),
      ])

      if (postsRes.ok) {
        const data = await postsRes.json()
        setPosts(data.posts || [])
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns || [])
      }
      if (segmentsRes.ok) {
        const data = await segmentsRes.json()
        setSegments(data.segments || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
    setLoading(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const stats = {
    totalPosts: posts.length,
    published: posts.filter(p => p.status === 'PUBLISHED').length,
    drafts: posts.filter(p => p.status === 'DRAFT').length,
    categories: categories.length,
    campaigns: campaigns.length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content</h1>
          <p className="text-text-secondary mt-1">
            Manage blog posts, categories, and marketing campaigns
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'posts' && (
            <button
              onClick={() => setShowNewPostModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              + New Post
            </button>
          )}
          {activeTab === 'categories' && (
            <button
              onClick={() => setShowNewCategoryModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              + New Category
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Total Posts</p>
          <p className="text-2xl font-bold mt-1">{stats.totalPosts}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Published</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{stats.published}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Drafts</p>
          <p className="text-2xl font-bold mt-1 text-yellow-400">{stats.drafts}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Categories</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">{stats.categories}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-secondary text-sm">Campaigns</p>
          <p className="text-2xl font-bold mt-1 text-blue-400">{stats.campaigns}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'categories', label: 'Categories' },
            { id: 'campaigns', label: 'Campaigns' },
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
          {activeTab === 'posts' && (
            <PostsTab
              posts={posts}
              categories={categories}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onDelete={deletePost}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              onRefresh={fetchData}
            />
          )}
          {activeTab === 'campaigns' && (
            <CampaignsTab
              campaigns={campaigns}
              segments={segments}
              onRefresh={fetchData}
            />
          )}
        </>
      )}

      {/* Modals */}
      {showNewPostModal && (
        <NewPostModal
          categories={categories}
          onClose={() => setShowNewPostModal(false)}
          onCreated={() => {
            setShowNewPostModal(false)
            fetchData()
          }}
        />
      )}

      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
          onCreated={() => {
            setShowNewCategoryModal(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
