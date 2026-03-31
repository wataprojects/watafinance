void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { currency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const locale = i18n.language === 'es' ? es : enUS;

  const formatNotificationDate = (date: Date) => {
    if (isToday(date)) {
      return t('notifications.today');
    }
    if (isTomorrow(date)) {
      return t('notifications.tomorrow');
    }
    return format(date, 'MMM d', { locale });
  };

  const handleItemClick = (notification: any) => {
    markAsRead(notification.id);
    
    switch (notification.type) {
      case 'income':
        navigate('/dashboard/income');
        break;
      case 'expense':
        navigate('/dashboard/expenses');
        break;
      case 'balance':
        navigate('/dashboard/accounts');
        break;
      case 'budget':
        navigate('/dashboard/budget');
        break;
      default:
        break;
    }
    
    onClose();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { icon: Home, label: t('nav.home'), path: '/dashboard' },
    { icon: Wallet, label: t('nav.accounts'), path: '/dashboard/accounts' },
    { icon: ArrowUpRight, label: t('nav.income'), path: '/dashboard/income' },
    { icon: ArrowUpRight, label: t('nav.expenses'), path: '/dashboard/expenses' },
    { icon: CalendarDays, label: t('nav.budget'), path: '/dashboard/budget' },
    { icon: Settings, label: t('nav.settings'), path: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 bg-background border-l shadow-lg transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t('notifications.title')}</h2>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <Button variant=&quot;ghost&quot; size=&quot;icon&quot; onClick={onClose}>
            <X className=&quot;h-5 w-5&quot; />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className=&quot;p-4 border-b space-y-2&quot;>
          <h3 className=&quot;text-white font-semibold&quot;>Movimientos</h3>
          <div className=&quot;grid grid-cols-2 gap-2&quot;>
            <Button
              variant=&quot;outline&quot;
              className=&quot;w-full&quot;
              onClick={() => {
                navigate('/dashboard/income');
                onClose();
              }}
            >
              <ArrowUpRight className=&quot;mr-2 h-4 w-4 text-green-500&quot; />
              {t('nav.income')}
            </Button>
            <Button
              variant=&quot;outline&quot;
              className=&quot;w-full&quot;
              onClick={() => {
                navigate('/dashboard/expenses');
                onClose();
              }}
            >
              <ArrowUpRight className=&quot;mr-2 h-4 w-4 text-red-500 rotate-90&quot; />
              {t('nav.expenses')}
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className=&quot;flex-1&quot;>
          <div className=&quot;p-4 space-y-2&quot;>
            {notifications.length === 0 ? (
              <div className=&quot;text-center py-8&quot;>
                <Bell className=&quot;h-12 w-12 mx-auto mb-4 text-muted-foreground&quot; />
                <p className=&quot;text-white font-medium mb-1&quot;>Sin movimientos</p>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  No hay movimientos programados para hoy o mañana
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-colors',
                    'hover:bg-accent',
                    !notification.read && 'bg-accent/50'
                  )}
                  onClick={() => handleItemClick(notification)}
                >
                  <div className=&quot;flex items-start gap-3&quot;>
                    <div
                      className={cn(
                        'mt-1 w-2 h-2 rounded-full flex-shrink-0',
                        notification.read ? 'bg-transparent' : 'bg-primary'
                      )}
                    />
                    <div className=&quot;flex-1 min-w-0&quot;>
                      <div className=&quot;flex items-center justify-between gap-2&quot;>
                        <p className=&quot;font-medium truncate&quot;>{notification.title}</p>
                        <span className=&quot;text-xs text-muted-foreground flex-shrink-0&quot;>
                          {formatNotificationDate(notification.date)}
                        </span>
                      </div>
                      <p className=&quot;text-sm text-muted-foreground truncate&quot;>
                        {notification.description}
                      </p>
                      {notification.amount && (
                        <p
                          className={cn(
                            'text-sm font-medium mt-1',
                            notification.type === 'income' ? 'text-green-500' : 'text-red-500'
                          )}
                        >
                          {notification.type === 'income' ? '+' : '-'}
                          {currency}
                          {notification.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className=&quot;p-4 border-t space-y-2&quot;>
          {unreadCount > 0 && (
            <Button variant=&quot;outline&quot; className=&quot;w-full&quot; onClick={markAllAsRead}>
              <Check className=&quot;mr-2 h-4 w-4&quot; />
              {t('notifications.markAllRead')}
            </Button>
          )}
          
          {/* Navigation Menu */}
          <div className=&quot;grid grid-cols-2 gap-2&quot;>
            {menuItems.slice(0, 4).map((item) => (
              <Button
                key={item.path}
                variant=&quot;ghost&quot;
                className=&quot;w-full justify-start&quot;
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <item.icon className=&quot;mr-2 h-4 w-4&quot; />
                <span className=&quot;truncate&quot;>{item.label}</span>
              </Button>
            ))}
          </div>
          
          <div className=&quot;flex gap-2 pt-2&quot;>
            <Button
              variant=&quot;outline&quot;
              size=&quot;icon&quot;
              onClick={toggleTheme}
              className=&quot;flex-1&quot;
            >
              {theme === 'dark' ? (
                <Sun className=&quot;h-4 w-4&quot; />
              ) : (
                <Moon className=&quot;h-4 w-4&quot; />
              )}
            </Button>
            <Button
              variant=&quot;outline&quot;
              size=&quot;icon&quot;
              onClick={handleLogout}
              disabled={isLoggingOut}
              className=&quot;flex-1 text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950&quot;
            >
              <LogOut className=&quot;h-4 w-4&quot; />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
">