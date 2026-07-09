import { redirect } from "next/navigation"

const EventsPage = (): never => {
	redirect("/dashboard/events/trends")
}

export default EventsPage