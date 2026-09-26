import re

def main():
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        app_jsx = f.read()

    with open('AdminDashboardView.jsx', 'r', encoding='utf-8') as f:
        admin_view = f.read()
    
    with open('NewTicketModal.jsx', 'r', encoding='utf-8') as f:
        new_ticket = f.read()
    
    with open('TicketDetailPage.jsx', 'r', encoding='utf-8') as f:
        ticket_detail = f.read()
        
    print("Files ready")

if __name__ == '__main__':
    main()
