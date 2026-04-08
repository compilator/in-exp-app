document.querySelectorAll('#categoryDropdownMenu .dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
        const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('categoryDropdownBtn'));
        if (dropdown) dropdown.hide();
    });
});

const offcanvas = document.getElementById('mobileMenu');
offcanvas.addEventListener('show.bs.offcanvas', () => {
    document.querySelector('.burger-icon').classList.add('active');
});
offcanvas.addEventListener('hide.bs.offcanvas', () => {
    document.querySelector('.burger-icon').classList.remove('active');
});

document.addEventListener('DOMContentLoaded', function () {
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  let categoryToDelete = null;

  if (deleteModal && confirmDeleteBtn) {
    deleteModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      categoryToDelete = button.getAttribute('data-category-name');
      console.log('Попытка удаления:', categoryToDelete);
    });

    confirmDeleteBtn.addEventListener('click', function () {
      if (categoryToDelete) {
        console.log('Категория удалена:', categoryToDelete);
        alert('Категория "' + categoryToDelete + '" успешно удалена!');
        const modalInstance = bootstrap.Modal.getInstance(deleteModal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    });
  }
});