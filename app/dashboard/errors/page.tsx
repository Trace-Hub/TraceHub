import { redirect } from "next/navigation";

const ErrorsPage = (): never => {
  redirect("/dashboard/errors/list");
};

export default ErrorsPage;
