document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(this.getAttribute('data-tab')).classList.add('active');
        });
    });
    
    // Listen for new orders
    const ordersRef = database.ref('orders').orderByChild('status').equalTo('new');
    ordersRef.on('child_added', snapshot => {
        const order = snapshot.val();
        order.id = snapshot.key;
        
        displayOrder(order);
    });
    
    function displayOrder(order) {
        const ordersContainer = document.getElementById('orders');
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order';
        orderElement.dataset.id = order.id;
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${item.price * item.quantity} ج.م</span>
                </div>
            `;
        });
        
        orderElement.innerHTML = `
            <div class="order-header">
                <span>الطلب #${order.id.substring(0, 5)} - طاولة ${order.table}</span>
                <span>${new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
            ${itemsHtml}
            <div class="order-notes">
                <strong>ملاحظات:</strong> ${order.notes || 'لا توجد ملاحظات'}
            </div>
            <div class="order-total">
                <strong>الإجمالي:</strong> ${order.total} ج.م
            </div>
            <div class="order-actions">
                <button class="action-btn complete-btn">تم التنفيذ</button>
                <button class="action-btn cancel-btn">إلغاء الطلب</button>
            </div>
        `;
        
        ordersContainer.prepend(orderElement);
        
        // Add event listeners to new buttons
        orderElement.querySelector('.complete-btn').addEventListener('click', () => updateOrderStatus(order.id, 'completed'));
        orderElement.querySelector('.cancel-btn').addEventListener('click', () => updateOrderStatus(order.id, 'cancelled'));
    }
    
    function updateOrderStatus(orderId, status) {
        database.ref(`orders/${orderId}/status`).set(status)
            .then(() => {
                const orderElement = document.querySelector(`.order[data-id="${orderId}"]`);
                if (orderElement) {
                    orderElement.style.opacity = '0.5';
                    orderElement.style.backgroundColor = status === 'completed' ? '#e8f5e9' : '#ffebee';
                    setTimeout(() => {
                        orderElement.remove();
                    }, 1000);
                }
            })
            .catch(error => {
                console.error('Error updating order:', error);
                alert('حدث خطأ أثناء تحديث حالة الطلب');
            });
    }
    
    // Menu management
    document.getElementById('add-item').addEventListener('click', function() {
        const name = document.getElementById('item-name').value;
        const price = document.getElementById('item-price').value;
        const type = document.getElementById('item-type').value;
        
        if (!name || !price) {
            alert('الرجاء إدخال اسم الصنف والسعر');
            return;
        }
        
        const newItem = {
            name: name,
            price: parseInt(price),
            type: type,
            available: true
        };
        
        database.ref('menu').push(newItem)
            .then(() => {
                alert(`تم إضافة ${name} إلى القائمة`);
                document.getElementById('item-name').value = '';
                document.getElementById('item-price').value = '';
            })
            .catch(error => {
                console.error('Error adding menu item:', error);
                alert('حدث خطأ أثناء إضافة الصنف');
            });
    });
});
