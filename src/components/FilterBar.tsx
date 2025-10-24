import { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { Button } from '@/components/ui/button';
import { issuesAPI } from '../api/issues';
import { Grid3x3, Table2, Search, X } from 'lucide-react';
import type { IssueCategory } from '../types';

const categories: (IssueCategory | 'All')[] = [
    'All',
    'Pothole',
    'Garbage',
    'Streetlight',
    'Water Supply',
    'Drainage',
    'Road Damage',
    'Parks',
    'Other',
];

interface FilterBarProps {
    onFilterChange: () => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
    const {
        viewMode,
        setViewMode,
        categoryFilter,
        setCategoryFilter,
        locationFilter,
        setLocationFilter,
        resetFilters
    } = useUIStore();

    const [locationInput, setLocationInput] = useState(locationFilter.query);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const handleLocationSearch = async () => {
        if (!locationInput.trim()) {
            setLocationFilter({ query: '', latitude: null, longitude: null });
            onFilterChange();
            return;
        }

        setIsGeocoding(true);
        try {
            const coords = await issuesAPI.geocodeLocation(locationInput);
            if (coords) {
                setLocationFilter({
                    query: locationInput,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                onFilterChange();
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleClearLocation = () => {
        setLocationInput('');
        setLocationFilter({ query: '', latitude: null, longitude: null });
        onFilterChange();
    };

    const handleResetFilters = () => {
        setLocationInput('');
        resetFilters();
        onFilterChange();
    };

    const hasActiveFilters = categoryFilter !== 'All' || locationFilter.query !== '';

    return (
        <div className="space-y-2">
            {/* View Mode and Reset */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
                    <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('grid')}
                        className="gap-2"
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('table')}
                        className="gap-2"
                    >
                        <Table2 className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>

            </div>

            {/* Filters Container */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 space-y-4">
                {/* Category Filter */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setCategoryFilter(category);
                                    onFilterChange();
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${categoryFilter === category
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location Search */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Search by Location
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                                placeholder="Enter location, pincode, or area..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-all"
                            />
                            {locationInput && (
                                <button
                                    onClick={handleClearLocation}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            onClick={handleLocationSearch}
                            disabled={isGeocoding || !locationInput.trim()}
                            className="gap-2"
                        >
                            {isGeocoding ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Search
                                </>
                            )}
                        </Button>
                    </div>
                    {locationFilter.query && locationFilter.latitude && (
                        <p className="text-xs text-muted-foreground mt-2">
                            📍 Showing issues near: {locationFilter.query}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
