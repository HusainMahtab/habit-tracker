'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';

type Habit = {
  id: number;
  name: string;
  target: number;
  unit: string;
  current: number;
  streak: number;
  weeklyData: { day: string; value: number }[];
  monthlyData: { date: string; value: number }[];
  color: string;
  icon: string;
};

const habitIcons = {
  sleep: '🌙',
  water: '💧',
  exercise: '🏋️',
  reading: '📚',
  meditation: '🧘',
  coding: '💻',
  walking: '🚶',
  journaling: '📝'
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = typeof window !== 'undefined' ? localStorage.getItem('habits') : null;
    return savedHabits ? JSON.parse(savedHabits) : [
      {
        id: 1,
        name: 'Sleep',
        target: 8,
        unit: 'hours',
        current: 7.2,
        streak: 5,
        color: '#6366f1',
        icon: habitIcons.sleep,
        weeklyData: Array.from({ length: 7 }, (_, i) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          value: 6 + Math.random() * 3
        })),
        monthlyData: Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}/${new Date().getMonth() + 1}`,
          value: 6 + Math.random() * 3
        }))
      },
      {
        id: 2,
        name: 'Water',
        target: 8,
        unit: 'glasses',
        current: 6.5,
        streak: 3,
        color: '#10b981',
        icon: habitIcons.water,
        weeklyData: Array.from({ length: 7 }, (_, i) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          value: 5 + Math.random() * 4
        })),
        monthlyData: Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}/${new Date().getMonth() + 1}`,
          value: 5 + Math.random() * 4
        }))
      },
      {
        id: 3,
        name: 'Exercise',
        target: 30,
        unit: 'minutes',
        current: 25,
        streak: 2,
        color: '#f59e0b',
        icon: habitIcons.exercise,
        weeklyData: Array.from({ length: 7 }, (_, i) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
          value: 15 + Math.random() * 20
        })),
        monthlyData: Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}/${new Date().getMonth() + 1}`,
          value: 15 + Math.random() * 20
        }))
      }
    ];
  });

  const [selectedHabit, setSelectedHabit] = useState<Habit>(habits[0]);
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    target: '',
    unit: '',
    icon: '🌱'
  });
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  const updateHabitValue = (id: number, value: number) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const newStreak = value >= habit.target ? habit.streak + 1 : 0;
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
        
        const updatedWeeklyData = [...habit.weeklyData.slice(1), {
          day: dayName,
          value: parseFloat(value.toFixed(1))
        }];
        
        const updatedMonthlyData = [...habit.monthlyData];
        const todayDate = `${today.getDate()}/${today.getMonth() + 1}`;
        const dayIndex = updatedMonthlyData.findIndex(d => d.date === todayDate);
        
        if (dayIndex !== -1) {
          updatedMonthlyData[dayIndex] = {
            date: todayDate,
            value: parseFloat(value.toFixed(1))
          };
        }

        // Show notification if streak is broken or extended
        if (newStreak === 0 && habit.streak > 0) {
          setNotification({
            show: true,
            message: `Oh no! Your ${habit.name} streak was broken.`,
            type: 'error'
          });
        } else if (newStreak > habit.streak && newStreak % 5 === 0) {
          setNotification({
            show: true,
            message: `Amazing! ${newStreak} day streak on ${habit.name}!`,
            type: 'success'
          });
        }

        setTimeout(() => {
          setNotification({show: false, message: '', type: 'success'});
        }, 3000);

        return {
          ...habit,
          current: parseFloat(value.toFixed(1)),
          weeklyData: updatedWeeklyData,
          monthlyData: updatedMonthlyData,
          streak: newStreak
        };
      }
      return habit;
    }));
  };

  const addHabit = () => {
    if (!newHabit.name || !newHabit.target || !newHabit.unit) {
      setNotification({
        show: true,
        message: 'Please fill all fields',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({show: false, message: '', type: 'success'});
      }, 3000);
      return;
    }
    
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    
    const habit: Habit = {
      id: habits.length > 0 ? Math.max(...habits.map(h => h.id)) + 1 : 1,
      name: newHabit.name,
      target: Number(newHabit.target),
      unit: newHabit.unit,
      current: 0,
      streak: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      icon: newHabit.icon,
      weeklyData: Array.from({ length: 7 }, (_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        value: 0
      })),
      monthlyData: Array.from({ length: 30 }, (_, i) => ({
        date: `${i + 1}/${new Date().getMonth() + 1}`,
        value: 0
      }))
    };
    
    setHabits([...habits, habit]);
    setNewHabit({ name: '', target: '', unit: '', icon: '🌱' });
    setShowModal(false);
    setNotification({
      show: true,
      message: `${habit.name} habit added successfully!`,
      type: 'success'
    });
    setTimeout(() => {
      setNotification({show: false, message: '', type: 'success'});
    }, 3000);
  };

  const deleteHabit = (id: number) => {
    setHabits(habits.filter(habit => habit.id !== id));
    if (selectedHabit.id === id) {
      setSelectedHabit(habits[0]);
    }
    setNotification({
      show: true,
      message: 'Habit deleted successfully',
      type: 'success'
    });
    setTimeout(() => {
      setNotification({show: false, message: '', type: 'success'});
    }, 3000);
  };

  const resetDailyHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { ...habit, current: 0 }
        : habit
    ));
  };

  const getCompletionPercentage = (habit: Habit) => {
    return Math.min(100, Math.round((habit.current / habit.target) * 100));
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // handle Schroll to view detailed stats
  const targetRef = useRef<HTMLDivElement>(null);
  interface HandleViewProps {
    id: number;
    name: string;
    target: number;
    unit: string;
    current: number;
    streak: number;
    weeklyData: { day: string; value: number }[];
    monthlyData: { date: string; value: number }[];
    color: string;
    icon: string;
  }

  const handleView = (habit: HandleViewProps): void => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
    setSelectedHabit(habit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            } text-white font-medium`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-xl font-bold text-gray-900">HabitHero</h1>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium cursor-pointer"
                onClick={() => setShowStreakModal(true)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                View Streaks
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Habit
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Habits</p>
                <p className="text-2xl font-semibold text-gray-900">{habits.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Best Streak</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {habits.reduce((max, habit) => Math.max(max, habit.streak), 0)} days
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Completion</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {habits.length > 0 
                    ? Math.round(habits.reduce((sum, habit) => sum + getCompletionPercentage(habit), 0) / habits.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {habits.map(habit => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{habit.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      <p className="text-sm text-gray-500">{habit.target} {habit.unit} daily</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {habit.current} {habit.unit}
                    </span>
                    <button 
                      onClick={() => setShowStreakModal(true)}
                      className={`text-sm font-medium flex items-center ${
                        habit.streak > 0 ? 'text-emerald-600' : 'text-gray-500'
                      } cursor-pointer`}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {habit.streak} days
                    </button>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {getCompletionPercentage(habit)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getCompletionPercentage(habit)}%` }}
                        transition={{ duration: 0.8 }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor(getCompletionPercentage(habit))}`}
                      ></motion.div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Adjust today's progress:</span>
                    <button 
                      onClick={() => resetDailyHabit(habit.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={habit.target * 1.5}
                    step={habit.unit === 'hours' || habit.unit === 'minutes' ? '0.1' : '1'}
                    value={habit.current}
                    onChange={(e) => updateHabitValue(habit.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">0 {habit.unit}</span>
                    <span className="text-xs text-gray-500">{habit.target} {habit.unit} (goal)</span>
                    <span className="text-xs text-gray-500">{Math.round(habit.target * 1.5)} {habit.unit}</span>
                  </div>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habit.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                        formatter={(value: number) => [`${value} ${habit.unit}`, 'Value']}
                      />
                      <Bar
                        dataKey="value"
                        fill={habit.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={()=>handleView(habit)}
                    className={`text-sm px-3 py-1 rounded-full transition-colors ${
                      selectedHabit.id === habit.id 
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } cursor-pointer`}
                  >
                    View detailed stats
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {habits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No habits yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first habit.</p>
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Habit
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Detailed Stats */}
        {habits.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8"
            ref={targetRef}
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <span className="text-2xl">{selectedHabit.icon}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedHabit.name} Statistics</h2>
                    <p className="text-sm text-gray-500">{selectedHabit.current} {selectedHabit.unit} today ({getCompletionPercentage(selectedHabit)}% of target)</p>
                  </div>
                </div>
                
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      activeTab === 'weekly'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } cursor-pointer`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      activeTab === 'monthly'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } cursor-pointer`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'weekly' ? (
                    <AreaChart data={selectedHabit.weeklyData}>
                      <defs>
                        <linearGradient id={`color${selectedHabit.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedHabit.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={selectedHabit.color} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                        formatter={(value: number) => [`${value} ${selectedHabit.unit}`, 'Value']}
                        labelFormatter={(label) => `Day: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={selectedHabit.color}
                        fillOpacity={1}
                        fill={`url(#color${selectedHabit.id})`}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={selectedHabit.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          border: 'none'
                        }}
                        formatter={(value: number) => [`${value} ${selectedHabit.unit}`, 'Value']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={selectedHabit.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: selectedHabit.color }}
                        activeDot={{ r: 5, fill: selectedHabit.color }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivation Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-2/3">
                <h2 className="text-xl font-bold text-white">Keep up the good work!</h2>
                <p className="mt-2 text-indigo-100 max-w-lg">
                  {habits.some(h => h.streak > 0)
                    ? `You're on a ${Math.max(...habits.map(h => h.streak))} day streak with some habits. Consistency is key to success!`
                    : "Every journey begins with a single step. Track your habits daily to build lasting routines."}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  Add another habit
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Habit</h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Habit Name
                    </label>
                    <input
                      type="text"
                      id="habit-name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g. Meditation"
                      value={newHabit.name}
                      onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        id="target"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. 8"
                        value={newHabit.target}
                        onChange={(e) => setNewHabit({...newHabit, target: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        id="unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. hours"
                        value={newHabit.unit}
                        onChange={(e) => setNewHabit({...newHabit, unit: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select an icon
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(habitIcons).map(([key, icon]) => (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className={`p-3 rounded-lg text-2xl ${newHabit.icon === icon ? 'bg-indigo-100 border-indigo-500' : 'bg-gray-100 border-transparent'} border-2`}
                          onClick={() => setNewHabit({...newHabit, icon})}
                        >
                          {icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={addHabit}
                  >
                    Add Habit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaks Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowStreakModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your Streaks</h2>
                  <button 
                    onClick={() => setShowStreakModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {habits.length > 0 ? (
                    habits.map(habit => (
                      <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{habit.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{habit.name}</h3>
                            <p className="text-sm text-gray-500">{habit.target} {habit.unit}/day</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          habit.streak > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {habit.streak} day{habit.streak !== 1 ? 's' : ''}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No streaks yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Start tracking habits to build streaks.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setShowStreakModal(false)}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" onClick={()=>window.open("https://mahtab-husain-pf.onrender.com/")} className="text-gray-400 hover:text-gray-500">
                <span className='font-[iteic]'>PF</span>
              </a>
              <a href="#" onClick={()=>window.open("https://github.com/HusainMahtab?tab=repositories")} className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 text-center md:text-right">
              <p className="text-base text-gray-500">
                &copy; {new Date().getFullYear()} HabitHero. All rights reserved.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Built with Next.js, Tailwind CSS, and Framer Motion
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}