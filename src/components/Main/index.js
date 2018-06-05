import React, { Component } from 'react';
import { DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import classNames from 'classnames';
import Select from 'react-select';
import moment, { min } from 'moment';
import { ResizableBox } from 'react-resizable'
import uuidv1 from 'uuid/v1';

import BookingBox from '../BookingBox';

import icon from '../../assets/calendar_48dp.png';

import { checkIfBookingExistsForARoom } from '../../utils/time-util'

import './main.scss';
import 'react-select/dist/react-select.css';

class Main extends Component {

    state = {
        scheduleType: 0,
        activeMenu: 'Schedule',
        activeLocations: [],
        showBookingModal: false,
        showAddRoomModal: false,
        addModalTitle: '',
        addModalRoom: '',
        addModalStartTime: '',
        addModalEndTime: '',
        bookings: [],
        rooms: [
            {
                name: 'Room 1',
                location: 'Location 1',
                img: 'room1.jpg',
                capacity: 10,
            },
            {
                name: 'Room 2',
                location: 'Location 1',
                img: 'room2.jpg',
                capacity: 5,
            },
            {
                name: 'Room 1',
                location: 'Location 2',
                img: 'room3.jpg',
                capacity: 9,
            },
            {
                name: 'Room 2',
                location: 'Location 2',
                img: 'room4.jpg',
                capacity: 3,
            },
            {
                name: 'Room 1',
                location: 'Location 3',
                img: 'room5.jpg',
                capacity: 15,
            },
            {
                name: 'Room 2',
                location: 'Location 3',
                img: 'room6.jpg',
                capacity: 2,
            }
        ]

    }

    eventKeyMapping = [
        'Day',
        'Week',
        'Month'
    ]

    sideMenu = [
        'Schedule',
        'Reports',
        'Manage'
    ]




    handleSelect = (eventKey) => {
        this.setState({
            scheduleType: eventKey
        })
    }

    handleMenuSelect = (menu) => {
        this.setState({
            activeMenu: menu
        })
    }

    handleAddBookingClick = (room, hour, minutes) => {
        const { startTime, endTime } = this.getActualTimes(hour, minutes);
        this.setState({
            showBookingModal: true,
            addModalRoom: room,
            addModalStartTime: { label: startTime, value: `${hour}:${minutes - 15}` },
            addModalEndTime: { label: endTime, value: `${hour}:${minutes}` },
        })
    }

    handleCloseBookingModal = () => {
        this.setState({
            showBookingModal: false
        })
    }

    getAllStartTimes = (room) => {
        const { bookings } = this.state;
        const startTimes = [];
        if (room) {
            for (let i = 0; i < 24; i++) {
                for (let j = 0; j < 60; j += 15) {
                    let time;
                    if (!checkIfBookingExistsForARoom(i, j, room, bookings)) {
                        const timeSection = i >= 12 ? 'pm' : 'am';
                        if (i > 12) {
                            time = `${i - 12}:${j} ${timeSection}`;
                        } else {
                            time = `${i}:${j} ${timeSection}`;
                        }
                        startTimes.push({
                            label: time,
                            value: `${i}:${j}`
                        })
                    }
                }
            }
        }
        return startTimes;
    }

    getAllEndTimes = (room) => {
        const { hour, minutes } = this.getNextEndTime(this.state.addModalStartTime ? this.state.addModalStartTime.value : '');
        const { bookings } = this.state;

        const endTimes = [];
        let foundAnotherBooking = false;
        for (let i = hour; i < 24; i++) {
            if (foundAnotherBooking) {
                break;
            }
            for (let j = 0; j < 60; j += 15) {
                if (foundAnotherBooking) {
                    break;
                }
                let time;
                if (i > hour || i === hour && j >= minutes) {
                    if (!checkIfBookingExistsForARoom(i, j, room, bookings)) {
                        const timeSection = i >= 12 ? 'pm' : 'am';
                        if (i > 12) {
                            time = `${i - 12}:${j} ${timeSection}`;
                        } else {
                            time = `${i}:${j} ${timeSection}`;
                        }
                        endTimes.push({
                            label: time,
                            value: `${i}:${j}`
                        })
                    } else {
                        foundAnotherBooking = true;
                    }
                }
            }
        }
        return endTimes;
    }

    handleStartTimeChange = (e) => {
        console.log(e);
        this.setState({
            addModalStartTime: e
        })
        this.checkAndUpdateEndTimeIfBefore(e.value);
    }

    getNextEndTime = (time) => {
        const [startTimeHour, startTimeMinute] = time.split(':').map(time => parseInt(time, 10));
        const startTotalMinutes = startTimeHour * 60 + startTimeMinute;
        const { addModalEndTime } = this.state;

        const newEndTimeHour = Math.floor((startTotalMinutes + 15) / 60);
        const newEndTimeMinutes = (startTotalMinutes + 15) % 60;
        return {
            hour: newEndTimeHour,
            minutes: newEndTimeMinutes
        }
        return newEndTime;
    }

    checkAndUpdateEndTimeIfBefore = (time) => {
        const [startTimeHour, startTimeMinute] = time.split(':').map(time => parseInt(time, 10));
        const startTotalMinutes = startTimeHour * 60 + startTimeMinute;
        const { addModalEndTime } = this.state;
        const [endTimeHour, endTimeMinute] = addModalEndTime.value.split(':').map(time => parseInt(time, 10));
        const endTotalMinutes = endTimeHour * 60 + endTimeMinute;
        if (startTotalMinutes > endTotalMinutes) {
            const newEndTimeHour = Math.floor((startTotalMinutes + 15) / 60);
            const newEndTimeMinutes = (startTotalMinutes + 15) % 60;
            let newEndTime;
            if (newEndTimeHour > 12) {
                newEndTime = {
                    label: `${newEndTimeHour - 12}:${newEndTimeMinutes} pm`,
                    value: `${newEndTimeHour}:${newEndTimeMinutes}`,
                }
            } else {
                newEndTime = {
                    label: `${newEndTimeHour}:${newEndTimeMinutes} am`,
                    value: `${newEndTimeHour}:${newEndTimeMinutes}`,
                }
            }

            this.setState({
                addModalEndTime: newEndTime
            })
        }
    }

    handleEndTimeChange = (e) => {
        this.setState({
            addModalEndTime: e
        })
    }

    handleTitleChange = (e) => {
        this.setState({
            addModalTitle: e.target.value
        })
    }

    handleBookingSave = () => {
        const { addModalEndTime, addModalTitle, addModalStartTime, addModalRoom } = this.state;

        const hasError = this.handleAddBookingValidation();

        if (!hasError) {

            const bookings = [...this.state.bookings, { ud: uuidv1(), title: addModalTitle, room: addModalRoom, start: addModalStartTime, end: addModalEndTime }];
            this.setState({
                bookings,
                addModalEndTime: '',
                addModalTitle: '',
                addModalRoom: '',
                showBookingModal: false
            })
        }

    }

    handleAddBookingValidation = () => {
        const { addModalEndTime, addModalTitle, addModalStartTime, addModalRoom } = this.state;
        let { addModalEndTimeError, addModalStartTimeError, addModalRoomError, addModalTitleError } = this.state;
        if (!addModalEndTime) {
            addModalEndTimeError = true;
        } else {
            addModalEndTimeError = false;
        }
        if (!addModalStartTime) {
            addModalStartTimeError = true;
        } else {
            addModalStartTimeError = false;
        }

        if (!addModalTitle) {
            addModalTitleError = true;
        } else {
            addModalTitleError = false;
        }

        if (!addModalRoom) {
            addModalRoomError = true;
        } else {
            addModalRoomError = false;
        }

        this.setState({
            addModalEndTimeError,
            addModalStartTimeError,
            addModalRoomError,
            addModalTitleError
        })
        return addModalEndTimeError || addModalStartTimeError || addModalRoomError || addModalTitleError
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

    handleEditBooking = (startMinutes, endMinutes, booking) => {
        const startTime = this.convertMinutesToTime(startMinutes);
        const endTime = this.convertMinutesToTime(endMinutes);
        let newBookings = [...this.state.bookings];
        const index = newBookings.findIndex(newBooking => newBooking.id === booking.id);
        if (index !== -1) {
            newBookings = [...newBookings.slice(0, index), { ...newBookings[index], start: startTime, end: endTime }, ...newBookings.slice(index + 1)]
            this.setState({
                bookings: newBookings
            })
        }
    }

    renderMinutesCell = (hour, minutes, room) => {
        const startBooking = this.checkIfBookingStartsWithThisBlock(hour, minutes, room);
        const { bookings } = this.state;
        const bookingExists = checkIfBookingExistsForARoom(hour, minutes, room, bookings);
        if (startBooking) {
            const widthOfBooking = this.getWidthOfBooking(startBooking);
            return (
                <BookingBox widthOfBooking={widthOfBooking} height={41} onEdit={this.handleEditBooking} booking={startBooking} />
            )
        } else if (bookingExists) {
            return null;
        } else {
            return (
                <div className="booking-add-icon" onClick={() => this.handleAddBookingClick(room, hour, minutes)}>
                    +
                </div>
            )
        }
    }

    getWidthOfBooking = (booking) => {
        let [bookingStartHour, bookingStartMin] = booking.start.value.split(':');
        let [bookingEndHour, bookingEndMin] = booking.end.value.split(':');
        bookingEndHour = parseInt(bookingEndHour, 10);
        bookingStartHour = parseInt(bookingStartHour, 10);
        bookingStartMin = parseInt(bookingStartMin, 10);
        bookingEndMin = parseInt(bookingEndMin, 10);

        const bookingStartMinutesPassed = bookingStartHour * 60 + bookingStartMin;
        const bookingEndMinutesPassed = bookingEndHour * 60 + bookingEndMin;
        return (bookingEndMinutesPassed - bookingStartMinutesPassed) * 2;
    }

    convertMinutesToTime = (totalMinutes) => {
        let hour = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        let timeSection = 'am';

        if (hour >= 12) {
            timeSection = 'pm';
        }
        if (hour > 12) {
            hour = hour - 12;
        }


        return {
            label: `${hour}:${minutes} ${timeSection}`,
            value: `${hour}:${minutes}`
        }

    }

    checkIfBookingStartsWithThisBlock = (hour, minutes, room) => {
        const { bookings } = this.state;
        const startHour = hour;
        const startMin = minutes - 15;
        const endHour = hour;
        const endMin = minutes;
        const startMinutesPassed = startHour * 60 + startMin;
        const endMinutesPassed = endHour * 60 + endMin;
        const { startTime, endTime } = this.getActualTimes(hour, minutes);
        return bookings.find((booking) => {
            let [bookingStartHour, bookingStartMin] = booking.start.value.split(':');
            let [bookingEndHour, bookingEndMin] = booking.end.value.split(':');
            bookingEndHour = parseInt(bookingEndHour, 10);
            bookingStartHour = parseInt(bookingStartHour, 10);
            bookingStartMin = parseInt(bookingStartMin, 10);
            bookingEndMin = parseInt(bookingEndMin, 10);

            const bookingStartMinutesPassed = bookingStartHour * 60 + bookingStartMin;
            const bookingEndMinutesPassed = bookingEndHour * 60 + bookingEndMin;

            return (room.name === booking.room.name && room.location === booking.room.location && startMinutesPassed === bookingStartMinutesPassed)

        });

    }

    handleAddRoomClick = () => {
        this.setState({
            showAddRoomModal: true
        })
    }

    handleCloseAddRoomModal = () => {
        this.setState({
            showAddRoomModal: false
        })
    }

    handleAddRoomInputChange = (key, e) => {
        this.setState({
            [key]: e.target.value
        })
    }

    handleAddRoomSave = () => {
        const { addRoomName, addRoomDirections, addRoomMaxCapacity, addRoomLocation, addRoomDesc } = this.state;
        const rooms = [{
            name: addRoomName,
            location: addRoomLocation,
            img: 'room1.jpg',
            capacity: addRoomMaxCapacity,
            directions: addRoomDirections
        }, ...this.state.rooms];
        this.setState({
            rooms,
            showAddRoomModal: false
        })

    }

    render() {
        console.log(this.state.bookings);
        return (
            <div className="main">
                <div className="header">
                    <div className="header__left">
                        <div className="header__icon">
                            <img src={icon} />
                        </div>
                        <div className="header__title">
                            Bakroom
                        </div>
                        <ResizableBox width={100} height={30}>
                            Resize
                        </ResizableBox>
                    </div>

                    <div className="header__right">
                        {this.state.activeMenu === 'Schedule' && <DropdownButton
                            bsStyle='primary'
                            title={this.eventKeyMapping[this.state.scheduleType]}
                            onSelect={this.handleSelect}
                        >
                            {
                                this.eventKeyMapping.map((val, ind) => {
                                    return <MenuItem key={ind} eventKey={ind.toString()} active={this.state.scheduleType === ind.toString()} >{val}</MenuItem>
                                })
                            }
                        </DropdownButton>}
                        {this.state.activeMenu === 'Manage' && <div className="header__right-manage">
                            <div className="add-room">
                                <button className="btn btn-primary add-room-button" onClick={this.handleAddRoomClick}>
                                    Add Room
                                </button>
                            </div>
                        </div>}
                    </div>
                </div>
                <div className="page-body">

                    <div className="sidebar">
                        <div className="menu">
                            {
                                this.sideMenu.map(menu => {
                                    return (
                                        <div className={classNames("menu__item", {
                                            "menu__item-active": this.state.activeMenu === menu
                                        })} onClick={() => this.handleMenuSelect(menu)} key={menu}>
                                            {menu}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    {this.state.activeMenu === 'Schedule' && <div className="schedule">
                        <div className="rooms-container">
                            <div className="rooms-body">
                                {
                                    this.state.rooms.map(room => {

                                        return (
                                            <div className="room" key={`${room.name}-${room.location}`}>
                                                <div className="room-title">
                                                    {room.name}
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="bookings">
                            <div className="bookings-daily">
                                <div className="day">
                                    <div className="day__header">
                                        {
                                            Array(24).fill().map((_, idx) => idx).map(hour => {
                                                return (
                                                    <div className="hour">
                                                        <div className="hour__value">
                                                            {hour > 12 ? (< span>{hour - 12} <span className="am-pm">pm</span></span>) : (< span>{hour} <span className="am-pm">{hour === 12 ? 'pm' : 'am'}</span></span>)}
                                                        </div>
                                                        <div className={`hour-${hour} hour__minutes`}>
                                                            <div className="minutes minutes-15">
                                                                15
                                                            </div>
                                                            <div className="minutes minutes-30">
                                                                30
                                                            </div>
                                                            <div className="minutes minutes-45">
                                                                45
                                                            </div>
                                                            <div className="minutes minutes-60">
                                                                60
                                                            </div>
                                                        </div>
                                                        {
                                                            this.state.rooms.map((room) => {
                                                                return (
                                                                    <div className={`day__body__room day__body__room-${room.name}`}>


                                                                        <div className={classNames('day__body__room__minutes', { 'day__body__room__minutes-booking-exists': checkIfBookingExistsForARoom(hour, 15, room, this.state.bookings) })} >

                                                                            {
                                                                                this.renderMinutesCell(hour, 15, room)
                                                                            }


                                                                        </div>

                                                                        <div className={classNames('day__body__room__minutes', { 'day__body__room__minutes-booking-exists': checkIfBookingExistsForARoom(hour, 30, room, this.state.bookings) })} >
                                                                            {this.renderMinutesCell(hour, 30, room)}
                                                                        </div>
                                                                        <div className={classNames('day__body__room__minutes', { 'day__body__room__minutes-booking-exists': checkIfBookingExistsForARoom(hour, 45, room, this.state.bookings) })} >
                                                                            {
                                                                                this.renderMinutesCell(hour, 45, room)
                                                                            }
                                                                        </div>
                                                                        <div className={classNames('day__body__room__minutes', { 'day__body__room__minutes-booking-exists': checkIfBookingExistsForARoom(hour, 60, room, this.state.bookings) })} >
                                                                            {
                                                                                this.renderMinutesCell(hour, 60, room)
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div >

                    </div>}
                    {
                        this.state.activeMenu === 'Manage' && <div className="manage">
                            <div className="manage__sections-name">
                                <div className="section">
                                    Rooms
                                </div>
                                <div className="section">
                                    Users
                                </div>
                            </div>
                            <div className="manage__sections-body">
                                <div className="sections-body-rooms">
                                    <div className="rooms-details">
                                        {
                                            this.state.rooms.map(room => {
                                                return (
                                                    <div className="room-detail" key={`${room.name}-${room.location}`}>
                                                        <div className="room-detail__image">
                                                            <img src={require(`../../assets/${room.img}`)} />
                                                        </div>
                                                        <div className="room-detail__name">{room.name} </div>
                                                        <div className="room-detail__location"><span className="room-detail__key">Location: </span> {room.location} </div>
                                                        <div className="room-detail__location"><span className="room-detail__key">Capacity: </span> {room.capacity} </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    }


                </div>

                <Modal show={!!this.state.showBookingModal} onHide={this.handleCloseBookingModal} dialogClassName="booking-modal" bsSize="small">
                    <Modal.Body>
                        <div className="booking-modal__header">
                            <div className="booking-modal__header__title">
                                Booking Room
                            </div>
                            <div className="booking-modal__header__date">
                                {moment().format('MMMM Do, YYYY')}
                            </div>
                        </div>
                        <div className="booking-modal__body bk-form-control">
                            <div className={classNames("booking-modal__body__title", { 'has-error': this.state.addModalTitleError })}>
                                <input type="text" placeholder="Meeting Title" onChange={this.handleTitleChange} value={this.state.addModalTitle} />
                            </div>
                            <div className="booking-modal__body__room">
                                <input type="text" placeholder="Room Name" onChange={this.handleRoomChange} value={this.state.addModalRoom.name} />
                            </div>
                            <div className="booking-modal__body__time">
                                <div className="booking-modal__body__time-start">
                                    <Select options={this.getAllStartTimes(this.state.addModalRoom)} onChange={this.handleStartTimeChange} value={this.state.addModalStartTime} arrowRenderer={null} />
                                </div>
                                <div className="booking-modal__body__time-end">
                                    <Select options={this.getAllEndTimes(this.state.addModalRoom)} onChange={this.handleEndTimeChange} value={this.state.addModalEndTime} arrowRenderer={null} />
                                </div>
                            </div>
                            <div className="booking-modal__body__desc">
                                <textarea placeholder="Description" />
                            </div>

                            <div className="booking-modal__body__actions">
                                <button className="btn btn-primary" onClick={this.handleBookingSave}> Book </button>
                                <button className="btn btn-secondary" onClick={this.handleCloseBookingModal}> Cancel </button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal show={this.state.showAddRoomModal} onHide={this.handleCloseAddRoomModal} dialogClassName="add-room-modal">
                    <Modal.Body>
                        <div className="add-room-modal__header">
                            <div className="add-room-modal__header__title">
                                Add Room
                            </div>
                        </div>
                        <div className="add-room-modal__body">
                            <div className="add-room-modal__body__main-info">
                                <div className="add-room-modal__body__name">
                                    <input type="text" placeholder="Name" onChange={(e) => this.handleAddRoomInputChange('addRoomName', e)} />
                                </div>

                                <div className="add-room-modal__body__max-capacity">
                                    <input type="number" placeholder="Max Capacity" onChange={(e) => this.handleAddRoomInputChange('addRoomMaxCapacity', e)} />
                                </div>
                            </div>

                            <div className="add-room-modal__body__location">
                                <input type="text" placeholder="Location" onChange={(e) => this.handleAddRoomInputChange('addRoomLocation', e)} />
                            </div>
                            <div className="add-room-modal__body__desc">
                                <textarea placeholder="Description" onChange={(e) => this.handleAddRoomInputChange('addRoomDesc', e)} />
                            </div>
                            <div className="add-room-modal__body__directions">
                                <textarea placeholder="Directions" onChange={(e) => this.handleAddRoomInputChange('addRoomDirections', e)} />
                            </div>
                            <div className="add-room-modal__body__actions">
                                <button className="btn btn-primary" onClick={this.handleAddRoomSave}> Add </button>
                                <button className="btn btn-secondary" onClick={this.handleCloseAddRoomModal}> Cancel </button>
                            </div>
                        </div>

                    </Modal.Body>
                </Modal>
            </div>
        )
    }

}



export default Main;