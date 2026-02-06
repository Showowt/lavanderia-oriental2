import { EmployeeLayout } from "@/components/layout/EmployeeLayout";

export default function EmployeeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayout>{children}</EmployeeLayout>;
}
