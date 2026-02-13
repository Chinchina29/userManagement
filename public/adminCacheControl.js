
(function() {
    'use strict';
    
    if (window.location.pathname !== '/admin' && window.location.pathname.startsWith('/admin')) {
        
        if (window.history && window.history.pushState) {
            
           
            window.history.replaceState(null, null, window.location.href);
            
            window.addEventListener('popstate', function(event) {
               
                window.history.pushState(null, null, window.location.href);
            });
            
            window.history.pushState(null, null, window.location.href);
        }
        
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
             
                window.location.reload();
            }
        });
        
        window.addEventListener('beforeunload', function() {
           
            if (!document.referrer.includes('/admin')) {
                if (window.sessionStorage) {
                    window.sessionStorage.clear();
                }
            }
        });
    }
    
})();