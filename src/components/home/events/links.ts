export const eventHref = (id: string) => `/eventos/${id}`;
export const listHref = (list: string) => `/eventos?lista=${list}`;
export const allEventsHref = "/eventos";
export const organizerHref = (organizerName: string) =>
  `/eventos?q=${encodeURIComponent(organizerName)}`;
