import React, { Component } from 'react';
import { ResizableBox, Resizable } from 'react-resizable'

class BookingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            width: props.widthOfBooking,
            height: 41
        }
    }

    componentWillReceiveProps({ widthOfBooking }) {
        debugger;
        this.setState({
            width: widthOfBooking
        })
    }

    getActualTimes = (hour, minutes) => {
        let timeSection = 'am';

        if (hour >= 12) {
            timeSection = 'pm';
        }
        if (hour > 12) {
            hour = hour - 12;
        }


        let startTime, endTime;

        if (minutes === 15) {
            startTime = `${hour}:00 ${timeSection}`;
        } else {
            startTime = `${hour}:${minutes - 15} ${timeSection}`;
        }

        if (minutes === 60) {
            endTime = `${hour + 1}:00 ${timeSection}`;
        } else {
            endTime = `${hour}:${minutes} ${timeSection}`;
        }

        return {
            startTime, endTime
        }
    }

    handleResize = (e, { element, size: { width, height } }) => {

        console.log(width);
        this.setState({
            width,
            height
        }, () => {
            debugger;
            const { booking: { start: { value } } } = this.props;
            let [hour, minutes] = value.split(':');
            hour = parseInt(hour, 10);
            minutes = parseInt(minutes, 10);
            const startTimeMinutes = hour * 60 + minutes;


            // (bookingEndMinutesPassed - bookingStartMinutesPassed) * 2 + (Math.floor((bookingEndMinutesPassed - bookingStartMinutesPassed) / 60) * 2);

            const endTimeMinutes = startTimeMinutes + (width / 2);
            this.props.onEdit(startTimeMinutes, endTimeMinutes, this.props.booking);
            // const endTime =

        })
    }

    handleBookingEdit = () => {

    }


    render() {
        const { booking } = this.props;
        const { width, height } = this.state;
        return (
            <Resizable draggableOpts={{ grid: [30] }} width={width} height={height} className="day__body__room__minutes-booking-starts" axis="x" onResize={this.handleResize}>
                <div style={{ height: '100%', width: `${width}px` }} onClick={this.handleBookingEdit}>
                    {booking.title}
                </div>
            </Resizable>
        )
    }
}

export default BookingBox;