// Family relationship model
// Tracks family members and their connections

const familyRelations = new Map(); // Map: userId -> [familyMemberIds]
const familyMetadata = new Map(); // Map: familyId -> { members: [...], createdAt: Date }

// Format: {
//   userId: string,
//   familyMembers: [string], // array of user IDs
//   relationship: string (e.g., 'father', 'mother', 'child')
//   household: string (household ID)
// }

class FamilyModel {
  // Create or get family group
  static createFamily(familyId, memberIds = []) {
    if (!familyMetadata.has(familyId)) {
      familyMetadata.set(familyId, {
        familyId,
        members: memberIds,
        createdAt: new Date()
      });
    }
    return familyMetadata.get(familyId);
  }

  // Add member to family
  static addMemberToFamily(familyId, userId) {
    let family = familyMetadata.get(familyId);
    
    if (!family) {
      family = this.createFamily(familyId, [userId]);
    } else if (!family.members.includes(userId)) {
      family.members.push(userId);
    }
    
    // Also set reverse mapping for quick lookup
    if (!familyRelations.has(userId)) {
      familyRelations.set(userId, []);
    }
    const userFamilies = familyRelations.get(userId);
    if (!userFamilies.includes(familyId)) {
      userFamilies.push(familyId);
    }
    
    return family;
  }

  // Remove member from family
  static removeMemberFromFamily(familyId, userId) {
    const family = familyMetadata.get(familyId);
    if (family) {
      family.members = family.members.filter(id => id !== userId);
    }
    
    const userFamilies = familyRelations.get(userId);
    if (userFamilies) {
      const index = userFamilies.indexOf(familyId);
      if (index > -1) {
        userFamilies.splice(index, 1);
      }
    }
    
    return family;
  }

  // Get family members for a user
  static getFamilyMembers(userId) {
    const result = [];
    familyMetadata.forEach(family => {
      if (family.members.includes(userId)) {
        result.push(...family.members.filter(id => id !== userId));
      }
    });
    return [...new Set(result)]; // Remove duplicates
  }

  // Get all families for a user
  static getUserFamilies(userId) {
    const familyIds = familyRelations.get(userId) || [];
    return familyIds.map(familyId => familyMetadata.get(familyId)).filter(Boolean);
  }

  // Get family details
  static getFamily(familyId) {
    return familyMetadata.get(familyId);
  }

  // Get all active family members (online)
  static getActiveFamilyMembers(userId) {
    return this.getFamilyMembers(userId);
  }

  // Check if two users are in the same family
  static areFamilyMembers(userId1, userId2) {
    const familyMembers = this.getFamilyMembers(userId1);
    return familyMembers.includes(userId2);
  }

  // Get all family members from all families of a user
  static getAllFamilyMembers(userId) {
    const familyIds = familyRelations.get(userId) || [];
    const allMembers = new Set();
    
    familyIds.forEach(familyId => {
      const family = familyMetadata.get(familyId);
      if (family) {
        family.members.forEach(memberId => {
          if (memberId !== userId) {
            allMembers.add(memberId);
          }
        });
      }
    });
    
    return Array.from(allMembers);
  }
}

module.exports = FamilyModel;
