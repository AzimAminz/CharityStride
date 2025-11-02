"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const useEvents = (itemsPerPage = 12, isCategoryPage = false) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Dapatkan values dari URL (hanya untuk category page)
  const urlPage = isCategoryPage ? parseInt(searchParams.get('page')) || 1 : 1;
  const urlCategory = isCategoryPage ? searchParams.get('category') || 'all' : 'all';
  const urlSearch = isCategoryPage ? searchParams.get('search') || '' : '';
  const urlNearest = isCategoryPage ? searchParams.get('nearest') === 'true' : false;
  const urlSort = isCategoryPage ? searchParams.get('sort') || 'default' : 'default';

  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Gunakan state yang sync dengan URL (hanya untuk category page)
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(urlSearch); // Query yang telah diapply
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [showNearestOnly, setShowNearestOnly] = useState(urlNearest);
  const [sortBy, setSortBy] = useState(urlSort);

  // Initial load
  useEffect(() => {
    fetchInitialEvents();
    getUserLocation();
  }, []);

  // Update URL ketika state berubah (hanya untuk category page)
  useEffect(() => {
    if (isCategoryPage) {
      updateURL();
    }
  }, [currentPage, selectedCategory, appliedSearchQuery, showNearestOnly, sortBy]);

  // Filter events ketika criteria berubah
  useEffect(() => {
    applyFilters();
  }, [allEvents, appliedSearchQuery, selectedCategory, showNearestOnly, userLocation]);

  // Update displayed events
  useEffect(() => {
    updateDisplayedEvents();
  }, [filteredEvents, currentPage, itemsPerPage, sortBy]);

  // Reset ke page 1 ketika filter berubah (hanya untuk category page)
  useEffect(() => {
    if (isCategoryPage && currentPage !== 1) {
      const hasFilterChanged = 
        appliedSearchQuery !== urlSearch ||
        selectedCategory !== urlCategory ||
        showNearestOnly !== urlNearest ||
        sortBy !== urlSort;
      
      if (hasFilterChanged) {
        setCurrentPage(1);
      }
    }
  }, [appliedSearchQuery, selectedCategory, showNearestOnly, sortBy]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        }
      );
    }
  };

  const fetchInitialEvents = async () => {
    try {
      setLoading(true);
      const mockEvents = Array.from({ length: 200 }, (_, index) => generateMockEvent(index));
      setAllEvents(mockEvents);
      setTotalCount(200);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  const generateMockEvent = (index) => {
    const types = ['volunteer', 'food_rescue', 'charity_run'];
    const type = types[index % types.length];
    
    const eventTemplates = {
      volunteer: [
        {
          title: "Beach Cleanup Volunteer",
          description: "Join us for a beach cleanup to preserve marine ecosystems and keep our beaches beautiful for everyone to enjoy.",
          location: "Pantai Batu Ferringhi, Penang",
          ngo: "Green Earth Society"
        },
        {
          title: "Community Garden Planting",
          description: "Help plant vegetables and maintain our community garden. No experience needed - we'll teach you everything!",
          location: "Taman Botani, Putrajaya",
          ngo: "Urban Farming Initiative"
        },
        {
          title: "Homeless Shelter Support",
          description: "Assist in preparing and serving meals at our homeless shelter. Your help brings warmth and hope to those in need.",
          location: "Pusat Jagaan Kuala Lumpur",
          ngo: "Hope Foundation Malaysia"
        }
      ],
      food_rescue: [
        {
          title: "Food Distribution Program",
          description: "Help distribute surplus food to underprivileged communities and reduce food waste in our city.",
          location: "Kompleks Masyarakat, KL",
          ngo: "Food Rescue Malaysia"
        },
        {
          title: "Food Bank Sorting",
          description: "Sort and package food donations at our central food bank. Help us ensure food reaches those who need it most.",
          location: "Puchong, Selangor",
          ngo: "Malaysia Food Bank"
        },
        {
          title: "Community Kitchen Prep",
          description: "Prepare ingredients and assist chefs in our community kitchen that serves free meals daily.",
          location: "Petaling Jaya Community Center",
          ngo: "Share The Meal Foundation"
        }
      ],
      charity_run: [
        {
          title: "Charity Run for Children",
          description: "5K fun run to raise funds for children's education. Run, walk, or jog - every step makes a difference!",
          location: "Taman Tasik Titiwangsa, KL",
          ngo: "Education Hope Foundation"
        },
        {
          title: "Sunrise Charity Marathon",
          description: "Full and half marathon options. Raise funds for cancer research while challenging yourself physically.",
          location: "Putrajaya Challenge Park",
          ngo: "Cancer Research Malaysia"
        },
        {
          title: "Family Fun Run & Carnival",
          description: "3K family-friendly run followed by carnival games and activities. Perfect for all ages!",
          location: "Taman Permaisuri, Cheras",
          ngo: "Children's Welfare Association"
        }
      ]
    };

    const template = eventTemplates[type][index % 3];
    
    return {
      id: `event-${index + 1}`,
      title: `${template.title} ${Math.floor(index / 3) + 1}`,
      type: type,
      location: template.location,
      latitude: 3.1390 + (Math.random() - 0.5) * 0.3,
      longitude: 101.6869 + (Math.random() - 0.5) * 0.3,
      start_date: `2024-0${(Math.floor(index / 5) % 9) + 1}-${(index % 28) + 1}`,
      capacity: [20, 30, 50, 100, 200][index % 5],
      points_per_participation: type === 'charity_run' ? 150 : type === 'volunteer' ? 100 : 80,
      fee: type === 'charity_run' ? [25, 30, 35, 40][index % 4] : 0,
      description: template.description,
      ngo_name: template.ngo,
      image_url: `/images/events/${type}-${(index % 3) + 1}.jpg`,
      registered: Math.floor(Math.random() * 50),
      duration: type === 'charity_run' ? '3-4 hours' : '2-3 hours',
      difficulty: ['Easy', 'Moderate', 'Challenging'][index % 3]
    };
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  const applyFilters = () => {
    let filtered = [...allEvents];

    // Search filter - gunakan appliedSearchQuery bukan searchQuery
    if (appliedSearchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        event.ngo_name.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(appliedSearchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => event.type === selectedCategory);
    }

    // Calculate distances if user location available
    if (userLocation) {
      filtered = filtered.map(event => ({
        ...event,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng, event.latitude, event.longitude
        )
      }));

      if (showNearestOnly) {
        filtered = filtered.filter(event => event.distance <= 50);
      }

      if (showNearestOnly) {
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }

    setFilteredEvents(filtered);
  };

  const updateDisplayedEvents = () => {
    if (isCategoryPage) {
      // Untuk category page: pagination + sorting
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      let paginated = filteredEvents.slice(startIndex, endIndex);
      
      // Apply sorting
      paginated = [...paginated].sort((a, b) => {
        switch (sortBy) {
          case "date":
            return new Date(a.start_date) - new Date(b.start_date);
          case "date-desc":
            return new Date(b.start_date) - new Date(a.start_date);
          case "distance":
            return (a.distance || Infinity) - (b.distance || Infinity);
          case "points":
            return b.points_per_participation - a.points_per_participation;
          case "name":
            return a.title.localeCompare(b.title);
          case "capacity":
            return b.capacity - a.capacity;
          default:
            return 0;
        }
      });
      
      setDisplayedEvents(paginated);
    } else {
      // Untuk main page: show semua filtered events (untuk sections)
      setDisplayedEvents(filteredEvents);
    }
  };

  const updateURL = () => {
    if (!isCategoryPage) return;
    
    const queryParams = new URLSearchParams();
    
    if (currentPage > 1) queryParams.set('page', currentPage.toString());
    if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    if (appliedSearchQuery) queryParams.set('search', appliedSearchQuery);
    if (showNearestOnly) queryParams.set('nearest', 'true');
    if (sortBy !== 'default') queryParams.set('sort', sortBy);
    
    const newUrl = `/events/category?${queryParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const goToPage = async (page) => {
    if (!isCategoryPage || page === currentPage || page < 1 || page > totalPages) return;
    
    setPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPage(page);
    setPageLoading(false);
  };

  // Fungsi untuk apply search (dipanggil apabila butang search ditekan)
  const applySearch = () => {
    setAppliedSearchQuery(searchQuery);
    if (isCategoryPage && currentPage !== 1) {
      setCurrentPage(1);
    }
    
  };

  // Fungsi untuk navigate ke category page dengan search query
  const navigateToCategoryPage = (category, sort = 'default') => {
    const queryParams = new URLSearchParams();
    if (category !== 'all') queryParams.set('category', category);
    if (sort !== 'default') queryParams.set('sort', sort);
    if (appliedSearchQuery) queryParams.set('search', appliedSearchQuery);
    if (showNearestOnly) queryParams.set('nearest', 'true');
    
    router.push(`/events/category?${queryParams.toString()}`);
  };

  // Fungsi untuk handle search dari main page
  const handleMainPageSearch = () => {
    navigateToCategoryPage('all');
  };

  return {
    // Untuk kedua-dua pages
    events: filteredEvents,
    displayedEvents: isCategoryPage ? displayedEvents : filteredEvents,
    loading,
    pageLoading,
    searchQuery,
    setSearchQuery,
    appliedSearchQuery, // Tambah ini untuk access applied search query
    selectedCategory,
    setSelectedCategory,
    showNearestOnly,
    setShowNearestOnly,
    userLocation,
    navigateToCategoryPage,
    applySearch, // Tambah fungsi applySearch
    handleMainPageSearch, // Tambah fungsi untuk main page
    totalCount,
    
    // Hanya untuk category page
    ...(isCategoryPage && {
      currentPage,
      totalPages,
      goToPage,
      sortBy,
      setSortBy
    })
  };
};