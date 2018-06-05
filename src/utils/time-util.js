export const checkIfBookingExistsForARoom = (hour, minutes, room, bookings) => {

    const startHour = hour;
    const startMin = minutes - 15;
    const endHour = hour;
    const endMin = minutes;
    const startMinutesPassed = startHour * 60 + startMin;
    const endMinutesPassed = endHour * 60 + endMin;
    return bookings.find((booking) => {
        let [bookingStartHour, bookingStartMin] = booking.start.value.split(':');
        let [bookingEndHour, bookingEndMin] = booking.end.value.split(':');
        bookingEndHour = parseInt(bookingEndHour, 10);
        bookingStartHour = parseInt(bookingStartHour, 10);
        bookingStartMin = parseInt(bookingStartMin, 10);
        bookingEndMin = parseInt(bookingEndMin, 10);

        const bookingStartMinutesPassed = bookingStartHour * 60 + bookingStartMin;
        const bookingEndMinutesPassed = bookingEndHour * 60 + bookingEndMin;

        return (room.name === booking.room.name && room.location === booking.room.location && startMinutesPassed >= bookingStartMinutesPassed && endMinutesPassed <= bookingEndMinutesPassed)


    });
}