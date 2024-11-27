from .models import *
import matplotlib
import matplotlib.pyplot as plt

matplotlib.use('Agg')

def format_pct_and_count(pct, allvals):
    absolute = int(pct / 100. * sum(allvals))
    return "{:.1f}%\n({:d})".format(pct, absolute)

# --------------------- Graph for Admin Portal --------------------------
def category_count():
    # Query counts directly from the database
    professional_role = Role.query.filter_by(name='professional').first()
    professional_count = professional_role.User.count()
    customer_role = Role.query.filter_by(name='customer').first()
    customer_count = customer_role.User.count()
    service_count = Service.query.count()
    service_request_count = ServiceRequest.query.count()

    if professional_count or customer_count or service_count or service_request_count:
        categories = ['Professionals', 'Customers', 'Services', 'Requests']
        counts = [professional_count, customer_count, service_count, service_request_count]
        
        plt.bar(categories, counts, color=['blue', 'green', 'red', 'orange'], align='center', alpha=0.5)
        plt.xticks(categories, ['Professional', 'Customer', 'Service', 'Request'])
        plt.xlabel('Categories', fontweight='bold')
        plt.ylabel('Count', fontweight='bold')
        plt.title('Count of Different Entities', fontweight='bold', fontsize=16)

        file_path = './static/images/category_count.png'
        plt.savefig(file_path, transparent = True)
        plt.close()
        return file_path
    
def professional_count_by_service():
    allservice = Service.query.all()
    professional_count = {}
    for service in allservice:
        professional_count[service.name] = User.query.filter_by(service_id=service.id).count()

    if professional_count:
        labels = list(professional_count.keys())
        values = list(professional_count.values())

        plt.bar(labels, values, align='center',color=['purple', 'green', 'red', 'orange'], alpha=0.5)

        plt.xticks(labels, labels, rotation=45, ha='center')
        plt.xlabel('Services', fontweight='bold')
        plt.ylabel('Count', fontweight='bold')
        plt.title('Count of Professionals by Service', fontweight='bold', fontsize=16)

        file_path = './static/images/professional_count_by_service.png'
        plt.tight_layout()
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path
        

def active_professional():
    professionals = (User.query.join(UserRoles, User.id == UserRoles.user_id)
        .join(Role, UserRoles.role_id == Role.id)
        .filter(Role.name == 'professional')
        .all()
    )
    if professionals:
        active_count = 0
        inactive_count = 0
        for professional in professionals:
            if professional.active:
                active_count += 1
            else:
                inactive_count += 1
        labels = ['Active', 'Inactive']
        sizes = [active_count, inactive_count]
        plt.title('Professionals Active vs Inactive', fontweight='bold', fontsize=16)
        color = ['green', 'salmon']
        explode = (0.1, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=color, autopct=lambda pct: format_pct_and_count(pct, sizes), shadow=True, startangle=140)
        plt.axis('equal')
        
        file_path = './static/images/active_professional.png'
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

def active_customer():
    customers = (User.query.join(UserRoles, User.id == UserRoles.user_id)
        .join(Role, UserRoles.role_id == Role.id)
        .filter(Role.name == 'customer')
        .all()
    )
    if customers:
        active_count = 0
        inactive_count = 0
        for customer in customers:
            if customer.active:
                active_count += 1
            else:
                inactive_count += 1
        labels = ['Active', 'Inactive']
        sizes = [active_count, inactive_count]
        plt.title('Customers Active vs Inactive', fontweight='bold', fontsize=16)
        color = ['green', 'salmon']
        explode = (0.1, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=color, autopct=lambda pct: format_pct_and_count(pct, sizes), shadow=True, startangle=140)
        plt.axis('equal')
        
        file_path = './static/images/active_customer.png'
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

def request_count_by_service():
    allservice = Service.query.all()
    request_count = {}
    for service in allservice:
        request_count[service.name] = ServiceRequest.query.filter_by(service_id=service.id).count()

    if request_count:
        labels = list(request_count.keys())
        values = list(request_count.values())
        
        plt.bar(labels, values, align='center',color=['blue', 'green', 'red', 'orange'], alpha=0.5)
        plt.xticks(labels, labels, rotation=45, ha='center')
        plt.xlabel('Services', fontweight='bold')
        plt.ylabel('Count', fontweight='bold')
        plt.title('Count of Requests by Service', fontweight='bold', fontsize=16)

        file_path = './static/images/request_count_by_service.png'
        plt.tight_layout()
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

def request_count_by_customer(id):
    requests = ServiceRequest.query.filter_by(customer_id=id).all()
    print('Requests:', requests)
    if requests:
        pending_count = 0
        accepted_count = 0
        closed_count = 0
        for req in requests:
            if req.status == 'Pending':
                pending_count += 1
            elif req.status == 'Accepted':
                accepted_count += 1
            elif req.status == 'Closed':
                closed_count += 1
        labels = ['Pending', 'Accepted', 'Closed']
        sizes = [pending_count, accepted_count, closed_count]
        plt.title('Service Request Status', fontweight='bold', fontsize=16)
        color = ['salmon', 'lightblue', 'green']
        explode = (0.1, 0, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=color, autopct=lambda pct: format_pct_and_count(pct, sizes), shadow=True, startangle=140)
        plt.axis('equal')
        
        file_path = f'./static/images/request_count_by_customer_{id}.png'
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

def request_count_by_professional(id):
    requests = ServiceRequest.query.filter_by(professional_id=id).all()
    print('Requests:', requests)
    if requests:
        pending_count = 0
        accepted_count = 0
        closed_count = 0
        for req in requests:
            if req.status == 'Pending':
                pending_count += 1
            elif req.status == 'Accepted':
                accepted_count += 1
            elif req.status == 'Closed':
                closed_count += 1
        labels = ['Pending', 'Accepted', 'Closed']
        sizes = [pending_count, accepted_count, closed_count]
        plt.title('Service Request Status', fontweight='bold', fontsize=16)
        color = ['orange', 'lightblue', 'green']
        explode = (0.1, 0, 0)
        plt.pie(sizes, explode=explode, labels=labels, colors=color, autopct=lambda pct: format_pct_and_count(pct, sizes), shadow=True, startangle=140)
        plt.axis('equal')
        
        file_path = f'./static/images/request_count_by_professional_{id}.png'
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

def rating_for_professional(id):
    reviews = (
        db.session.query(User.name.label('customer_name'), Review.rating)
        .join(Review, Review.customer_id == User.id)
        .filter(Review.professional_id == id)
        .all()
    )
    if reviews:
        customers = [review.customer_name for review in reviews]
        ratings = [review.rating for review in reviews]
        plt.bar(customers, ratings,color=['blue', 'green', 'red', 'orange'], align='center', alpha=0.5)
        plt.xlabel('Customers', fontweight='bold')
        plt.ylabel('Ratings', fontweight='bold')
        plt.title('Ratings for Professional', fontweight='bold', fontsize=16)

        file_path = f'./static/images/rating_for_professional_{id}.png'
        plt.savefig(file_path, transparent=True)
        plt.close()
        return file_path

