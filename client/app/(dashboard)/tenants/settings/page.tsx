"use client"

import Loading from "@/components/Loading"
import SettingsForm from "@/components/SettingsForm"
import { useGetAuthUserQuery, useUpdateTenantSettingsMutation } from "@/state/api"

const TenantSettings = () => {
    const { data: authUser, isLoading } = useGetAuthUserQuery()
    const [updateTenant] = useUpdateTenantSettingsMutation()

    if (isLoading) {
        return (
            <div className="relative w-full min-h-[320px]">
                <Loading />
            </div>
        )
    }

    const initialData = {
        name: authUser?.userInfo?.name ?? "",
        email: authUser?.userInfo?.email ?? "",
        phoneNumber: authUser?.userInfo?.phoneNumber ?? "",
    }
    const handleSubmit = async (data: typeof initialData) => {
        await updateTenant({
            cognitoId: authUser?.cognitoInfo?.id as string,
            ...data,
        })
    }
    return (
        <SettingsForm initialData={initialData} onSubmit={handleSubmit} userType='tenant' />
    )
}

export default TenantSettings