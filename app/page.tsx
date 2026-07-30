import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth/actions";

export default async function Home() {
  redirect((await hasAnyUser()) ? "/employees" : "/setup");
}
