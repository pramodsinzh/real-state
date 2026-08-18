"use client"

import { SettingsFormData, settingsSchema } from '@/lib/schemas'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from './ui/form'
import { CustomFormField } from './FormField'
import { Button } from './ui/button'
import { ChangePasswordForm } from './ChangePasswordForm'
import { useGetAuthUserQuery } from '@/state/api'
import { Pencil, X, User } from 'lucide-react'
import { DeleteAccountSection } from './DeleteAccountSection'

const SettingsForm = ({ initialData, onSubmit, userType }: SettingsFormProps) => {
  const { data: authUser } = useGetAuthUserQuery()
  const [editMode, setEditMode] = useState(false)
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
    if (editMode) {
      form.reset(initialData)
    }
  }

  const handleSubmit = async (data: SettingsFormData) => {
    await onSubmit(data)
    setEditMode(false)
  }

  const initials = (initialData.name || "U").charAt(0).toUpperCase()

  return (
    <div className="pt-10 pb-16 px-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {`${userType.charAt(0).toUpperCase() + userType.slice(1)} Settings`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details and account preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {initials || <User className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Personal information
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Your name, email, and phone number
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleEditMode}
            className="gap-1.5 transition-colors duration-300"
          >
            {editMode ? (
              <>
                <X className="w-3.5 h-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </>
            )}
          </Button>
        </div>

        <div className="px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <CustomFormField name="name" label="Name" disabled={!editMode} />
                <CustomFormField
                  name="phoneNumber"
                  label="Phone Number"
                  disabled={!editMode}
                />
              </div>
              <CustomFormField
                name="email"
                label="Email"
                type="email"
                disabled={!editMode}
              />

              {editMode && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-secondary-500 text-white hover:bg-gray-900 transition-colors duration-300"
                  >
                    Save changes
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>

      {authUser?.cognitoInfo?.hasPassword && <ChangePasswordForm />}
      {authUser?.cognitoInfo?.hasPassword && <ChangePasswordForm />}
      <div className="mt-6">
        <DeleteAccountSection />
      </div>
    </div>
  )
}

export default SettingsForm