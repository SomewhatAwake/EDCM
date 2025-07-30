import {api} from '../config';

export const carrierService = {
  getCarriers: async () => {
    const response = await api.get('/carrier');
    return response.data;
  },

  getCarrier: async (carrierId) => {
    const response = await api.get(`/carrier/${carrierId}`);
    return response.data;
  },

  updateDockingPermissions: async (carrierId, dockingAccess, notoriousAccess) => {
    const response = await api.put(`/carrier/${carrierId}/docking`, {
      dockingAccess,
      notoriousAccess,
    });
    return response.data;
  },

  jumpToSystem: async (carrierId, targetSystem) => {
    const response = await api.post(`/carrier/${carrierId}/jump`, {
      targetSystem,
    });
    return response.data;
  },

  updateServices: async (carrierId, services) => {
    const response = await api.put(`/carrier/${carrierId}/services`, {
      services,
    });
    return response.data;
  },

  getMarketData: async (carrierId) => {
    const response = await api.get(`/carrier/${carrierId}/market`);
    return response.data;
  },

  updateCarrierName: async (carrierId, name) => {
    const response = await api.put(`/carrier/${carrierId}/name`, {
      name,
    });
    return response.data;
  },
};
