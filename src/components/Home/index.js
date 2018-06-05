import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './home.scss';

class Home extends Component {
    render() {
        return (
            <div className="main">
                <div className="header">
                    HEADER
                </div>
                <div className="mr-body">
                    <div className="navbar">
                        SCHEDULE
                    </div>
                    <div className="location">
                        LOCATION
                    </div>
                    <div className="bookings-view-body">
                        BOOKINGS
                    </div>
                </div>
            </div>

        )
    }

}

module.exports = Home;