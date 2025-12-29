import {mockDateManager} from 'src/test-helpers/manager.mocks';
import {DefaultCalendarService} from 'src/presentation/services/default.calendar-service';
import {mockDateManagerFactory} from 'src/test-helpers/factory.mocks';
import {DEFAULT_PLUGIN_SETTINGS, PluginSettings} from 'src/domain/settings/plugin.settings';
import {when} from 'jest-when';
import {DEFAULT_GENERAL_SETTINGS, GeneralSettings} from 'src/domain/settings/general.settings';
import {DayOfWeek, Week, WeekNumberStandard} from 'src/domain/models/week';
import {Period, PeriodType} from 'src/domain/models/period.model';

describe('DefaultCalendarService', () => {
    const dateManager = mockDateManager;
    const expectedMonth = <Period> {
        date: new Date(2023, 9),
        name: 'October',
        type: PeriodType.Month
    };
    const expectedQuarter = <Period> {
        date: new Date(2023, 6),
        name: 'Q3',
        type: PeriodType.Quarter
    };
    const expectedYear = <Period> {
        date: new Date(2023, 0),
        name: '2023',
        type: PeriodType.Year
    };

    let service: DefaultCalendarService;

    beforeEach(() => {
        const dateManagerFactory = mockDateManagerFactory(dateManager);

        service = new DefaultCalendarService(dateManagerFactory);

        when(dateManager.getPreviousWeeks).mockReturnValue([]);
        when(dateManager.getNextWeeks).mockReturnValue([]);
        when(dateManager.getPreviousMonth).mockReturnValue([]);
        when(dateManager.getNextMonth).mockReturnValue([]);
    });

    describe('getCurrentWeek', () => {
        const currentWeek = <Week> {
            date: new Date(2023, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: expectedMonth,
            days: []
        };

        it('should use the default settings for the firstDayOfWeek and weekNumberStandard if the initialize method has not been called', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            // Act
            service.getCurrentWeek();

            // Assert
            expect(dateManager.getCurrentWeek).toHaveBeenCalledWith(settings.generalSettings.firstDayOfWeek, settings.generalSettings.weekNumberStandard);
        });

        it('should use the custom settings for the firstDayOfWeek and weekNumberStandard if the initialize method has been called', async () => {
            // Arrange
            const settings = <PluginSettings> { ...DEFAULT_PLUGIN_SETTINGS,
                generalSettings: <GeneralSettings> { ...DEFAULT_GENERAL_SETTINGS,
                    firstDayOfWeek: DayOfWeek.Sunday,
                    weekNumberStandard: WeekNumberStandard.US
                }
            };

            // Act
            service.initialize(settings);
            service.getCurrentWeek();

            // Assert
            expect(dateManager.getCurrentWeek).toHaveBeenCalledWith(settings.generalSettings.firstDayOfWeek, settings.generalSettings.weekNumberStandard);
        });
        
        it('should get the previous two weeks from the date manager', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            when(dateManager.getCurrentWeek).mockReturnValue(currentWeek);

            // Act
            service.getCurrentWeek();

            // Assert
            expect(dateManager.getPreviousWeeks).toHaveBeenCalledWith(
                currentWeek,
                settings.generalSettings.firstDayOfWeek,
                settings.generalSettings.weekNumberStandard,
                2
            );
        });
        
        it('should get the next to weeks from the date manager', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            when(dateManager.getCurrentWeek).mockReturnValue(currentWeek);

            // Act
            service.getCurrentWeek();

            // Assert
            expect(dateManager.getNextWeeks).toHaveBeenCalledWith(
                currentWeek,
                settings.generalSettings.firstDayOfWeek,
                settings.generalSettings.weekNumberStandard,
                3
            );
        });
        
        it('should return the weeks sorted based on the week number', async () => {
            // Arrange
            const firstWeek = <Week> {
                date: new Date(2023, 9, 2),
                name: '42',
                type: PeriodType.Week,
                weekNumber: 42,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const currentWeek = <Week> {
                date: new Date(2023, 9, 9),
                name: '43',
                type: PeriodType.Week,
                weekNumber: 43,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const lastWeek = <Week> {
                date: new Date(2023, 9, 16),
                name: '44',
                type: PeriodType.Week,
                weekNumber: 44,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };

            when(dateManager.getCurrentWeek).mockReturnValue(lastWeek);
            when(dateManager.getPreviousWeeks).mockReturnValue([currentWeek]);
            when(dateManager.getNextWeeks).mockReturnValue([firstWeek]);

            // Act
            const result = service.getCurrentWeek();

            // Assert
            expect(result).toEqual([firstWeek, currentWeek, lastWeek]);
        });
    });

    describe('getPreviousWeek', () => {
        const currentWeeks = [<Week>{
            date: new Date(2023, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: expectedMonth,
            days: []
        }];

        it('should use the default settings for the firstDayOfWeek and weekNumberStandard if the initialize method has not been called', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            // Act
            service.getPreviousWeek(currentWeeks);

            // Assert
            expect(dateManager.getPreviousWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    4
                );
            expect(dateManager.getNextWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    1
                );
        });

        it('should use the custom settings for the firstDayOfWeek and weekNumberStandard if the initialize method has been called', async () => {
            // Arrange
            const settings = <PluginSettings> { ...DEFAULT_PLUGIN_SETTINGS,
                generalSettings: <GeneralSettings> { ...DEFAULT_GENERAL_SETTINGS,
                    firstDayOfWeek: DayOfWeek.Sunday,
                    weekNumberStandard: WeekNumberStandard.US
                }
            };

            // Act
            service.initialize(settings);
            service.getPreviousWeek(currentWeeks);

            // Assert
            expect(dateManager.getPreviousWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    4
                );
            expect(dateManager.getNextWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    1
                );
        });

        it('should return the weeks sorted based on the week number', async () => {
            // Arrange
            const firstWeek = <Week> {
                date: new Date(2023, 9, 2),
                name: '42',
                type: PeriodType.Week,
                weekNumber: 42,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const currentWeek = <Week> {
                date: new Date(2023, 9, 9),
                name: '43',
                type: PeriodType.Week,
                weekNumber: 43,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const lastWeek = <Week> {
                date: new Date(2023, 9, 16),
                name: '44',
                type: PeriodType.Week,
                weekNumber: 44,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };

            when(dateManager.getPreviousWeeks).mockReturnValue([lastWeek]);
            when(dateManager.getNextWeeks).mockReturnValue([firstWeek]);

            // Act
            const result = service.getPreviousWeek([currentWeek]);

            // Assert
            expect(result).toEqual([firstWeek, currentWeek, lastWeek]);
        });
    });

    describe('getNextWeek', () => {
        const currentWeeks = [<Week>{
            date: new Date(2023, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: expectedMonth,
            days: []
        }];

        it('should use the default settings for the firstDayOfWeek and weekNumberStandard if the initialize method has not been called', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            // Act
            service.getNextWeek(currentWeeks);

            // Assert
            expect(dateManager.getPreviousWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    2
                );
            expect(dateManager.getNextWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    3
                );
        });

        it('should use the custom settings for the firstDayOfWeek and weekNumberStandard if the initialize method has been called', async () => {
            // Arrange
            const settings = <PluginSettings> { ...DEFAULT_PLUGIN_SETTINGS,
                generalSettings: <GeneralSettings> { ...DEFAULT_GENERAL_SETTINGS,
                    firstDayOfWeek: DayOfWeek.Sunday,
                    weekNumberStandard: WeekNumberStandard.US
                }
            };

            // Act
            service.initialize(settings);
            service.getNextWeek(currentWeeks);

            // Assert
            expect(dateManager.getPreviousWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    2
                );
            expect(dateManager.getNextWeeks)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard,
                    3
                );
        });

        it('should return the weeks sorted based on the week number', async () => {
            // Arrange
            const firstWeek = <Week> {
                date: new Date(2023, 9, 2),
                name: '42',
                type: PeriodType.Week,
                weekNumber: 42,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const currentWeek = <Week> {
                date: new Date(2023, 9, 9),
                name: '43',
                type: PeriodType.Week,
                weekNumber: 43,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const lastWeek = <Week> {
                date: new Date(2023, 9, 16),
                name: '44',
                type: PeriodType.Week,
                weekNumber: 44,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };

            when(dateManager.getPreviousWeeks).mockReturnValue([lastWeek]);
            when(dateManager.getNextWeeks).mockReturnValue([firstWeek]);

            // Act
            const result = service.getNextWeek([currentWeek]);

            // Assert
            expect(result).toEqual([firstWeek, currentWeek, lastWeek]);
        });
    });

    describe('getPreviousMonth', () => {
        const currentWeeks = [<Week>{
            date: new Date(2023, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: expectedMonth,
            days: []
        }];

        it('should use the default settings for the firstDayOfWeek and weekNumberStandard if the initialize method has not been called', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            // Act
            service.getPreviousMonth(currentWeeks);

            // Assert
            expect(dateManager.getPreviousMonth)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard
                );
        });

        it('should use the custom settings for the firstDayOfWeek and weekNumberStandard if the initialize method has been called', async () => {
            // Arrange
            const settings = <PluginSettings> { ...DEFAULT_PLUGIN_SETTINGS,
                generalSettings: <GeneralSettings> { ...DEFAULT_GENERAL_SETTINGS,
                    firstDayOfWeek: DayOfWeek.Sunday,
                    weekNumberStandard: WeekNumberStandard.US
                }
            };

            // Act
            service.initialize(settings);
            service.getPreviousMonth(currentWeeks);

            // Assert
            expect(dateManager.getPreviousMonth)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard
                );
        });

        it('should return the weeks sorted based on the week number', async () => {
            // Arrange
            const firstWeek = <Week> {
                date: new Date(2023, 9, 2),
                name: '42',
                type: PeriodType.Week,
                weekNumber: 42,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const currentWeek = <Week> {
                date: new Date(2023, 9, 9),
                name: '43',
                type: PeriodType.Week,
                weekNumber: 43,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const lastWeek = <Week> {
                date: new Date(2023, 9, 16),
                name: '44',
                type: PeriodType.Week,
                weekNumber: 44,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };

            when(dateManager.getPreviousMonth).mockReturnValue([lastWeek, firstWeek, currentWeek]);

            // Act
            const result = service.getPreviousMonth([currentWeek]);

            // Assert
            expect(result).toEqual([firstWeek, currentWeek, lastWeek]);
        });
    });

    describe('getNextMonth', () => {
        const currentWeeks = [<Week>{
            date: new Date(2023, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: expectedMonth,
            days: []
        }];

        it('should use the default settings for the firstDayOfWeek and weekNumberStandard if the initialize method has not been called', async () => {
            // Arrange
            const settings = DEFAULT_PLUGIN_SETTINGS;

            // Act
            service.getNextMonth(currentWeeks);

            // Assert
            expect(dateManager.getNextMonth)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard
                );
        });

        it('should use the custom settings for the firstDayOfWeek and weekNumberStandard if the initialize method has been called', async () => {
            // Arrange
            const settings = <PluginSettings> { ...DEFAULT_PLUGIN_SETTINGS,
                generalSettings: <GeneralSettings> { ...DEFAULT_GENERAL_SETTINGS,
                    firstDayOfWeek: DayOfWeek.Sunday,
                    weekNumberStandard: WeekNumberStandard.US
                }
            };

            // Act
            service.initialize(settings);
            service.getNextMonth(currentWeeks);

            // Assert
            expect(dateManager.getNextMonth)
                .toHaveBeenCalledWith(
                    currentWeeks[0],
                    settings.generalSettings.firstDayOfWeek,
                    settings.generalSettings.weekNumberStandard
                );
        });

        it('should return the weeks sorted based on the week number', async () => {
            // Arrange
            const firstWeek = <Week> {
                date: new Date(2023, 9, 2),
                name: '42',
                type: PeriodType.Week,
                weekNumber: 42,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const currentWeek = <Week> {
                date: new Date(2023, 9, 9),
                name: '43',
                type: PeriodType.Week,
                weekNumber: 43,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };
            const lastWeek = <Week> {
                date: new Date(2023, 9, 16),
                name: '44',
                type: PeriodType.Week,
                weekNumber: 44,
                year: expectedYear,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: []
            };

            when(dateManager.getNextMonth).mockReturnValue([lastWeek, firstWeek, currentWeek]);

            // Act
            const result = service.getNextMonth([currentWeek]);

            // Assert
            expect(result).toEqual([firstWeek, currentWeek, lastWeek]);
        });
    });

    describe('getMonthForWeeks', () => {
        const firstDay = <Period> { date: new Date(2022, 9, 5), name: '05', type: PeriodType.Day };
        const secondDay = <Period> { date: new Date(2023, 9, 12), name: '12', type: PeriodType.Day };
        const thirdDay = <Period> { date: new Date(2025, 9, 16), name: '16', type: PeriodType.Day };
        const fourthDay = <Period> { date: new Date(2026, 9, 23), name: '23', type: PeriodType.Day };
        const fifthDay = <Period> { date: new Date(2027, 9, 28), name: '28', type: PeriodType.Day };
        const sixthDay = <Period> { date: new Date(2028, 9, 12), name: '12', type: PeriodType.Day };

        const firstWeek = <Week> {
            date: new Date(2022, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2022, 1),
                name: 'February',
                type: PeriodType.Month
            },
            days: [firstDay]
        };
        const secondWeek = <Week> {
            date: new Date(2023, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2023, 2),
                name: 'February',
                type: PeriodType.Month
            },
            days: [secondDay]
        };
        const thirdWeek = <Week> {
            date: new Date(2025, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2025, 2),
                name: 'February',
                type: PeriodType.Month
            },
            days: [thirdDay]
        };
        const fourthWeek = <Week> {
            date: new Date(2026, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2026, 2),
                name: 'February',
                type: PeriodType.Month
            },
            days: [fourthDay]
        };
        const fifthWeek = <Week> {
            date: new Date(2027, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2027, 2),
                name: 'February',
                type: PeriodType.Month
            },
            days: [fifthDay]
        };
        const sixthWeek = <Week> {
            date: new Date(2028, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: expectedQuarter,
            month: <Period> {
                date: new Date(2028, 2),
                name: 'February',
                type: PeriodType.Month
            },
            days: [sixthDay]
        };
        it('should return the month based on the middle day of the middle week for an odd number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek];
            when(dateManager.getMonth).calledWith(secondDay).mockReturnValue(secondWeek.month);

            // Act
            const result = service.getMonthForWeeks(weeks);

            // Assert
            expect(dateManager.getMonth).toHaveBeenCalledWith(secondDay);
            expect(result).toEqual(secondWeek.month);
        });

        it('should return the month based on the middle day of the middle week for an even number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek, fourthWeek, fifthWeek, sixthWeek];
            when(dateManager.getMonth).calledWith(fourthDay).mockReturnValue(fourthWeek.month);

            // Act
            const result = service.getMonthForWeeks(weeks);

            // Assert
            expect(dateManager.getMonth).toHaveBeenCalledWith(fourthDay);
            expect(result).toEqual(fourthWeek.month);
        });
    });

    describe('getQuarterForWeeks', () => {
        const firstDay = <Period> { date: new Date(2022, 9, 5), name: '05', type: PeriodType.Day };
        const secondDay = <Period> { date: new Date(2023, 9, 12), name: '12', type: PeriodType.Day };
        const thirdDay = <Period> { date: new Date(2025, 9, 16), name: '16', type: PeriodType.Day };
        const fourthDay = <Period> { date: new Date(2026, 9, 23), name: '23', type: PeriodType.Day };
        const fifthDay = <Period> { date: new Date(2027, 9, 28), name: '28', type: PeriodType.Day };
        const sixthDay = <Period> { date: new Date(2028, 9, 12), name: '12', type: PeriodType.Day };

        const firstWeek = <Week> {
            date: new Date(2022, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2022, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [firstDay]
        };
        const secondWeek = <Week> {
            date: new Date(2023, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2023, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [secondDay]
        };
        const thirdWeek = <Week> {
            date: new Date(2025, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2025, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [thirdDay]
        };
        const fourthWeek = <Week> {
            date: new Date(2026, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2026, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [fourthDay]
        };
        const fifthWeek = <Week> {
            date: new Date(2027, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2027, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [fifthDay]
        };
        const sixthWeek = <Week> {
            date: new Date(2028, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: expectedYear,
            quarter: <Period> {
                date: new Date(2028, 1),
                name: 'Q1',
                type: PeriodType.Quarter
            },
            month: expectedMonth,
            days: [sixthDay]
        };
        it('should return the quarter based on the middle day of the middle week for an odd number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek];
            const monthForDay = <Period> { date: new Date(2023, 9), name: 'October', type: PeriodType.Month };
            when(dateManager.getMonth).calledWith(secondDay).mockReturnValue(monthForDay);
            when(dateManager.getQuarter).calledWith(monthForDay).mockReturnValue(secondWeek.quarter);

            // Act
            const result = service.getQuarterForWeeks(weeks);

            // Assert
            expect(dateManager.getQuarter).toHaveBeenCalledWith(monthForDay);
            expect(result).toEqual(secondWeek.quarter);
        });

        it('should return the quarter based on the middle day of the middle week for an even number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek, fourthWeek, fifthWeek, sixthWeek];
            const monthForDay = <Period> { date: new Date(2026, 9), name: 'October', type: PeriodType.Month };
            when(dateManager.getMonth).calledWith(fourthDay).mockReturnValue(monthForDay);
            when(dateManager.getQuarter).calledWith(monthForDay).mockReturnValue(fourthWeek.quarter);

            // Act
            const result = service.getQuarterForWeeks(weeks);

            // Assert
            expect(dateManager.getQuarter).toHaveBeenCalledWith(monthForDay);
            expect(result).toEqual(fourthWeek.quarter);
        });
    });

    describe('getYearForWeeks', () => {
        const firstDay = <Period> { date: new Date(2022, 9, 5), name: '05', type: PeriodType.Day };
        const secondDay = <Period> { date: new Date(2023, 9, 12), name: '12', type: PeriodType.Day };
        const thirdDay = <Period> { date: new Date(2025, 9, 16), name: '16', type: PeriodType.Day };
        const fourthDay = <Period> { date: new Date(2026, 9, 23), name: '23', type: PeriodType.Day };
        const fifthDay = <Period> { date: new Date(2027, 9, 28), name: '28', type: PeriodType.Day };
        const sixthDay = <Period> { date: new Date(2028, 9, 12), name: '12', type: PeriodType.Day };

        const firstWeek = <Week> {
            date: new Date(2022, 9, 2),
            name: '42',
            type: PeriodType.Week,
            weekNumber: 42,
            year: <Period> {
                date: new Date(2022, 0),
                name: '2022',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [firstDay]
        };
        const secondWeek = <Week> {
            date: new Date(2023, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: <Period> {
                date: new Date(2023, 0),
                name: '2023',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [secondDay]
        };
        const thirdWeek = <Week> {
            date: new Date(2025, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: <Period> {
                date: new Date(2025, 0),
                name: '2025',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [thirdDay]
        };
        const fourthWeek = <Week> {
            date: new Date(2026, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: <Period> {
                date: new Date(2026, 0),
                name: '2026',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [fourthDay]
        };
        const fifthWeek = <Week> {
            date: new Date(2027, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: <Period> {
                date: new Date(2027, 0),
                name: '2027',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [fifthDay]
        };
        const sixthWeek = <Week> {
            date: new Date(2028, 9, 9),
            name: '43',
            type: PeriodType.Week,
            weekNumber: 43,
            year: <Period> {
                date: new Date(2028, 0),
                name: '2028',
                type: PeriodType.Year
            },
            quarter: expectedQuarter,
            month: expectedMonth,
            days: [sixthDay]
        };
        it('should return the year based on the middle day of the middle week for an odd number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek];
            when(dateManager.getYear).calledWith(secondDay).mockReturnValue(secondWeek.year);

            // Act
            const result = service.getYearForWeeks(weeks);

            // Assert
            expect(dateManager.getYear).toHaveBeenCalledWith(secondDay);
            expect(result).toEqual(secondWeek.year);
        });

        it('should return the year based on the middle day of the middle week for an even number of weeks', () => {
            // Arrange
            const weeks = [firstWeek, secondWeek, thirdWeek, fourthWeek, fifthWeek, sixthWeek];
            when(dateManager.getYear).calledWith(fourthDay).mockReturnValue(fourthWeek.year);

            // Act
            const result = service.getYearForWeeks(weeks);

            // Assert
            expect(dateManager.getYear).toHaveBeenCalledWith(fourthDay);
            expect(result).toEqual(fourthWeek.year);
        });
    });

    describe('December 29, 2025 edge case', () => {
        it('should return December 2025 for month when Dec 29 is selected (even though middle day is Jan 1)', () => {
            // Arrange - December 29, 2025 is a Monday and starts ISO week 1 of 2026
            const december29 = <Period> { date: new Date(2025, 11, 29), name: '29', type: PeriodType.Day };
            const december30 = <Period> { date: new Date(2025, 11, 30), name: '30', type: PeriodType.Day };
            const december31 = <Period> { date: new Date(2025, 11, 31), name: '31', type: PeriodType.Day };
            const january1 = <Period> { date: new Date(2026, 0, 1), name: '01', type: PeriodType.Day };
            const january2 = <Period> { date: new Date(2026, 0, 2), name: '02', type: PeriodType.Day };
            const january3 = <Period> { date: new Date(2026, 0, 3), name: '03', type: PeriodType.Day };
            const january4 = <Period> { date: new Date(2026, 0, 4), name: '04', type: PeriodType.Day };

            const decemberMonth = <Period> {
                date: new Date(2025, 11, 1),
                name: 'December',
                type: PeriodType.Month
            };

            const januaryMonth = <Period> {
                date: new Date(2026, 0, 1),
                name: 'January',
                type: PeriodType.Month
            };

            // Week spanning Dec 29 - Jan 4
            const week = <Week> {
                date: new Date(2025, 11, 29),
                name: '01',
                type: PeriodType.Week,
                weekNumber: 1,
                year: <Period> { date: new Date(2026, 0, 1), name: '2026', type: PeriodType.Year },
                quarter: expectedQuarter,
                month: decemberMonth,
                days: [december29, december30, december31, january1, january2, january3, january4]
            };

            const weeks = [week];

            // Mock: december29 -> December 2025, january1 -> January 2026
            when(dateManager.getMonth).calledWith(december29).mockReturnValue(decemberMonth);
            when(dateManager.getMonth).calledWith(january1).mockReturnValue(januaryMonth);

            // Act - pass selectedPeriod = december29
            const result = service.getMonthForWeeks(weeks, december29);

            // Assert - should use december29, not the middle day (january1)
            expect(dateManager.getMonth).toHaveBeenCalledWith(december29);
            expect(result).toEqual(decemberMonth);
            expect(result.name).toBe('December');
        });

        it('should return 2025 for year when Dec 29 is selected (even though middle day is Jan 1)', () => {
            // Arrange
            const december29 = <Period> { date: new Date(2025, 11, 29), name: '29', type: PeriodType.Day };
            const december30 = <Period> { date: new Date(2025, 11, 30), name: '30', type: PeriodType.Day };
            const december31 = <Period> { date: new Date(2025, 11, 31), name: '31', type: PeriodType.Day };
            const january1 = <Period> { date: new Date(2026, 0, 1), name: '01', type: PeriodType.Day };
            const january2 = <Period> { date: new Date(2026, 0, 2), name: '02', type: PeriodType.Day };
            const january3 = <Period> { date: new Date(2026, 0, 3), name: '03', type: PeriodType.Day };
            const january4 = <Period> { date: new Date(2026, 0, 4), name: '04', type: PeriodType.Day };

            const year2025 = <Period> {
                date: new Date(2025, 0, 1),
                name: '2025',
                type: PeriodType.Year
            };

            const year2026 = <Period> {
                date: new Date(2026, 0, 1),
                name: '2026',
                type: PeriodType.Year
            };

            const week = <Week> {
                date: new Date(2025, 11, 29),
                name: '01',
                type: PeriodType.Week,
                weekNumber: 1,
                year: year2026,
                quarter: expectedQuarter,
                month: expectedMonth,
                days: [december29, december30, december31, january1, january2, january3, january4]
            };

            const weeks = [week];

            // Mock: december29 -> 2025, january1 -> 2026
            when(dateManager.getYear).calledWith(december29).mockReturnValue(year2025);
            when(dateManager.getYear).calledWith(january1).mockReturnValue(year2026);

            // Act - pass selectedPeriod = december29
            const result = service.getYearForWeeks(weeks, december29);

            // Assert - should use december29, not the middle day (january1)
            expect(dateManager.getYear).toHaveBeenCalledWith(december29);
            expect(result).toEqual(year2025);
            expect(result.name).toBe('2025');
        });
    });
});
