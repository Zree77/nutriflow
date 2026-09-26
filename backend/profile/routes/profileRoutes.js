import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { validate } from '../../middleware/validate.js';
import * as controllers from '../controllers/profileController.js';
import * as validators from '../validators/profileValidator.js';

const router = Router();

// All routes are protected
router.use(protect);

// Profile
router.get('/', controllers.getProfileController);
router.put('/', validate(validators.updateProfileValidator), controllers.updateProfileController);

// Dashboard
router.get('/dashboard', controllers.getDashboardController);

// Upcoming Deliveries
router.get('/upcoming-deliveries', controllers.getUpcomingDeliveriesController);

// Statistics
router.get('/statistics', controllers.getStatisticsController);

// Addresses
router.get('/addresses', controllers.getAddressesController);
router.post('/addresses', validate(validators.addAddressValidator), controllers.addAddressController);
router.put('/addresses/:id', validate(validators.updateAddressValidator), controllers.updateAddressController);
router.delete('/addresses/:id', validate(validators.addressIdValidator), controllers.deleteAddressController);
router.patch('/addresses/:id/default', validate(validators.addressIdValidator), controllers.setDefaultAddressController);

export default router;
