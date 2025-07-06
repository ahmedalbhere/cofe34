document.addEventListener('DOMContentLoaded', function() {
    const quantities = {};
    let total = 0;
    
    // Initialize quantities
    document.querySelectorAll('.quantity').forEach(q => {
        const item = q.getAttribute('data-item');
        quantities[item] = 0;
    });
    
    // Handle plus/minus buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.getAttribute('data-item');
            const price = parseInt(this.getAttribute('data-price'));
            const quantityElement = document.querySelector(`.quantity[data-item="${item}"]`);
            
            if (this.classList.contains('plus')) {
                quantities[item]++;
                total += price;
            } else if (this.classList.contains('minus') && quantities[item] > 0) {
                quantities[item]--;
                total -= price;
            }
            
            quantityElement.textContent = quantities[item];
            document.getElementById('total-amount').textContent = total;
        });
    });
    
    // Submit order to Firebase
    document.getElementById('submit-order').addEventListener('click', function() {
        const tableNumber = document.getElementById('table').value;
        const notes = document.getElementById('notes').value;
        
        if (!tableNumber) {
            alert('الرجاء إدخال رقم الطاولة');
            return;
        }
        
        if (total === 0) {
            alert('الرجاء اختيار مشروب واحد على الأقل');
            return;
        }
        
        const order = {
            table: tableNumber,
            items: [],
            notes: notes,
            total: total,
            status: 'new',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        for (const item in quantities) {
            if (quantities[item] > 0) {
                order.items.push({
                    name: item,
                    quantity: quantities[item],
                    price: parseInt(document.querySelector(`.plus[data-item="${item}"]`).getAttribute('data-price'))
                });
            }
        }
        
        // Send order to Firebase
        const newOrderRef = database.ref('orders').push();
        newOrderRef.set(order)
            .then(() => {
                alert(`تم إرسال الطلب للطاولة ${tableNumber}\nالإجمالي: ${total} ج.م`);
                
                // Reset form
                document.getElementById('table').value = '';
                document.getElementById('notes').value = '';
                for (const item in quantities) {
                    quantities[item] = 0;
                    document.querySelector(`.quantity[data-item="${item}"]`).textContent = '0';
                }
                total = 0;
                document.getElementById('total-amount').textContent = '0';
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                alert('حدث خطأ أثناء إرسال الطلب، الرجاء المحاولة مرة أخرى');
            });
    });
});
