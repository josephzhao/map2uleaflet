<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


namespace Map2u\LeafletBundle\Subscriber;
         
use Doctrine\ORM\Event\LoadClassMetadataEventArgs;
         
class TablePrefixSubscriber implements \Doctrine\Common\EventSubscriber
{
    protected $prefix = '';
 
    public function __construct($prefix)
    {
        $this->prefix = (string) $prefix;
    }
 
    public function getSubscribedEvents()
    {
        return array('loadClassMetadata');
    }
         
    public function loadClassMetadata(LoadClassMetadataEventArgs $args)
    {
        $classMetadata = $args->getClassMetadata();
 
        // Do not re-apply the prefix in an inheritance hierarchy.
        if ($classMetadata->isInheritanceTypeSingleTable() && !$classMetadata->isRootEntity()) {
            return;
        }
 
        if (FALSE !== strpos($classMetadata->namespace, 'Map2u\LeafletBundle')) {
            $classMetadata->setPrimaryTable(array('name' => $this->prefix . $classMetadata->getTableName()));
 
            foreach ($classMetadata->getAssociationMappings() as $fieldName => $mapping) {
                if ($mapping['type'] == \Doctrine\ORM\Mapping\ClassMetadataInfo::MANY_TO_MANY
                  && isset($classMetadata->associationMappings[$fieldName]['joinTable']['name'])) {
                    $mappedTableName = $classMetadata->associationMappings[$fieldName]['joinTable']['name'];
                    $classMetadata->associationMappings[$fieldName]['joinTable']['name'] = $this->prefix . $mappedTableName;
                }
            }
        }
    }
}