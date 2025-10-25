'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || ''
    })
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'FARMER':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'DISTRIBUTOR':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'RETAILER':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="bg-card border rounded-lg p-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                <div className={`mt-4 px-4 py-2 rounded-full border text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                  <Shield className="w-4 h-4 inline mr-1" />
                  {user.role}
                </div>
              </div>

              <div className="pt-6 border-t space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="ml-auto font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Account Details</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="p-3 bg-accent/50 rounded-lg">{user.name}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="p-3 bg-accent/50 rounded-lg">{user.email}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium mb-2">
                    <Shield className="w-4 h-4 mr-2" />
                    Role
                  </label>
                  <div className="p-3 bg-accent/50 rounded-lg flex items-center justify-between">
                    <span>{user.role}</span>
                    <span className="text-xs text-muted-foreground">Cannot be changed</span>
                  </div>
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
