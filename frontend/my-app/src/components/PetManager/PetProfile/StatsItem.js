import React from "react";
import styles from './PetProfile.module.css'

const StatsItem = ({ label, value }) => {
    return (
        <div className={styles.statItem}>
            <label>{label}:</label>
            <span>{value}</span>
        </div>
    );
};

export default StatsItem;