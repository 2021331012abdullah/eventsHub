import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPublicEvents, getMyEvents } from "@/lib/actions/events";
import Link from "next/link";
import EventsClient from "@/components/EventsClient";
import "./events.css";

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [publicEvents, myEvents] = await Promise.all([
    getPublicEvents(),
    getMyEvents(),
  ]);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="section-header animate-fade-in">
          <div>
            <h1 className="section-title">Events</h1>
            <p className="section-subtitle">Browse public events or manage your own</p>
          </div>
          <Link href="/events/create" className="btn btn-primary">
            + Create Event
          </Link>
        </div>

        <EventsClient
          publicEvents={JSON.parse(JSON.stringify(publicEvents))}
          myEvents={JSON.parse(JSON.stringify(myEvents))}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
