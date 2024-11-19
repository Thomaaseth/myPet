import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

const SearchBar = ({ value, onChange }) => (
    <div className={styles.searchBar}>
        <Search className={styles.searchIcon} />
            <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search documents..."
            className="search-input"
            />
        </div>
);

export default SearchBar;