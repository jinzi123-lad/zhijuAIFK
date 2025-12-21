import { TenantDetail } from "@/components/tenant-detail"

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TenantDetail tenantId={Number.parseInt(id)} />
}
