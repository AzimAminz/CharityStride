import { getEventById } from "../../lib/api/publicEventsApi";
import EventDetailsPageClient from "./EventDetailsPage";

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const { event } = await getEventById(id);
    return {
      title: event.title,
      description: event.description,
      openGraph: {
        title: event.title,
        description: event.description,
        images: [event.thumbnail],
      },
    };
  } catch (error) {
    return {
      title: "Event Details",
    };
  }
}

export default function EventDetailsPage() {
  return <EventDetailsPageClient />;
}
