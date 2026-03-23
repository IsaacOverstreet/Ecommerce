import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/admin/auth/[...nextAuth]/route";
import { redirect } from "next/navigation";
export default function Dashboard() {
  const session = getServerSession(authOptions);
  if (!session) {
    redirect("/admin/Login");
  }
  return (
    <div className="w-[100%] h-dvh border ">
      <p>Test Button</p>
    </div>
  );
}
