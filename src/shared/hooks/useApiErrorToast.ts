import { useEffect } from "react";
import { toast } from "sonner";

const useApiErrorToast = (isError: boolean, message: string): void => {
	useEffect(() => {
		if (isError) toast.error(message);
	}, [isError, message]);
};

export default useApiErrorToast;
