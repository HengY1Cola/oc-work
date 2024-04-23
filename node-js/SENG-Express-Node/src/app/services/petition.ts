import {SupportTier} from "../models/support_tier.model";
import {Supporter} from "../models/supporter.model";
import {Petition} from "../models/petition.model";

function aggregateData(petitions: Petition[], supportTiers: SupportTier[], supporters: Supporter[]): Petition[] {
    const supportTiersByPetition: Map<number, SupportTier[]> = supportTiers.reduce((acc, tier) => {
        const tiers = acc.get(tier.petition_id) || [];
        tiers.push(tier);
        acc.set(tier.petition_id, tiers);
        return acc;
    }, new Map<number, SupportTier[]>());
    const supportersBySupportTier: Map<number, Supporter[]> = supporters.reduce((acc, supporter) => {
        const currentSupporters = acc.get(supporter.supportTierId) || [];
        currentSupporters.push(supporter);
        acc.set(supporter.supportTierId, currentSupporters);
        return acc;
    }, new Map<number, Supporter[]>());
    return petitions.map(petition => {
        const tiers = supportTiersByPetition.get(petition.petitionId) || [];
        const tiersWithSupporters = tiers.map(tier => ({
            ...tier,
            supporterList: supportersBySupportTier.get(tier.id) || []
        }));
        const supportingCost = tiersWithSupporters.reduce((acc, each) => acc + (each.supporterList.length === 0 ? 0 : each.cost), 0);
        return {
            ...petition,
            tierList: tiersWithSupporters,
            supportingCost
        };
    });
}

interface FilterCriteria {
    q?: string;
    supportingCost?: number;
    ownerId?: number;
    supporterId?: number;
    categoryIdsList?: number[];
}

function filterPetitions(petitions: Petition[], criteria: FilterCriteria): Petition[] {
    if (criteria.categoryIdsList.length === 0 && !criteria.q && !criteria.ownerId && !criteria.supporterId && !criteria.supportingCost) {
        return petitions;
    }
    return petitions.filter(petition => {
        if (criteria.q && !(petition.title.toLowerCase().includes(criteria.q) || petition.description.toLowerCase().includes(criteria.q))) {
            return false;
        }
        if (criteria.supportingCost !== undefined) {
            return petition.tierList.some(element => element.cost <= criteria.supportingCost);
        }
        if (criteria.ownerId && petition.ownerId !== criteria.ownerId) {
            return false;
        }
        if (criteria.supporterId) {
            const hasSupporter = petition.tierList.some(tier =>
                tier.supporterList.some(supporter => supporter.userId === criteria.supporterId));
            if (!hasSupporter) {
                return false;
            }
        }
        return !(criteria.categoryIdsList.length !== 0 && !criteria.categoryIdsList.includes(petition.categoryId));
    });
}

function sortPetitions(petitions: Petition[], sortBy: string): Petition[] {
    return petitions.sort((a, b) => {
        let primaryComparison = 0;
        switch (sortBy) {
            case 'ALPHABETICAL_ASC':
                primaryComparison = a.title.localeCompare(b.title);
                break;
            case 'ALPHABETICAL_DESC':
                primaryComparison = b.title.localeCompare(a.title);
                break;
            case 'COST_ASC':
                primaryComparison = a.supportingCost - b.supportingCost;
                break;
            case 'COST_DESC':
                primaryComparison = b.supportingCost - a.supportingCost;
                break;
            case 'CREATED_ASC':
                primaryComparison = new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
                break;
            case 'CREATED_DESC':
                primaryComparison = new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
                break;
            default:
                throw new Error("no type")
        }
        return primaryComparison === 0 ? a.petitionId - b.petitionId : primaryComparison;
    });
}

function paginatePetitions(petitions: Petition[], startIndex: number, count: number): Petition[] {
    const endIndex = startIndex + count;
    return petitions.slice(startIndex, endIndex);
}

export {aggregateData, FilterCriteria, filterPetitions, sortPetitions, paginatePetitions}